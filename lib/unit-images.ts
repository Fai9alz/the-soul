// ─── The Soul — Unit Images (Supabase) ────────────────────────────────────────
// Run this SQL in Supabase Dashboard → SQL Editor before use:
//
//   CREATE TABLE unit_images (
//     id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
//     unit_id     UUID        NOT NULL REFERENCES units(id) ON DELETE CASCADE,
//     image_url   TEXT        NOT NULL,
//     sort_order  INTEGER     NOT NULL DEFAULT 0,
//     is_primary  BOOLEAN     NOT NULL DEFAULT false,
//     created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
//   );
//   CREATE INDEX ON unit_images (unit_id);
//   ALTER TABLE unit_images ENABLE ROW LEVEL SECURITY;
//   CREATE POLICY "Public read"            ON unit_images FOR SELECT TO public        USING (true);
//   CREATE POLICY "Authenticated insert"   ON unit_images FOR INSERT TO authenticated WITH CHECK (true);
//   CREATE POLICY "Authenticated update"   ON unit_images FOR UPDATE TO authenticated USING (true);
//   CREATE POLICY "Authenticated delete"   ON unit_images FOR DELETE TO authenticated USING (true);
// ─────────────────────────────────────────────────────────────────────────────

import { supabase } from "./supabase";

const BUCKET = "units";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface UnitImage {
  id:        string;
  unitId:    string;
  imageUrl:  string;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: string;
}

interface ImageRow {
  id:         string;
  unit_id:    string;
  image_url:  string;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}

function rowToImage(row: ImageRow): UnitImage {
  return {
    id:        row.id,
    unitId:    row.unit_id,
    imageUrl:  row.image_url,
    sortOrder: row.sort_order,
    isPrimary: row.is_primary,
    createdAt: row.created_at,
  };
}

// ── Storage helpers ───────────────────────────────────────────────────────────

async function uploadFile(file: File): Promise<string> {
  const ext  = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, cacheControl: "3600", upsert: false });

  if (error) throw new Error(error.message);
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

async function removeFile(url: string): Promise<void> {
  const marker = `/object/public/${BUCKET}/`;
  const i = url.indexOf(marker);
  const path = i >= 0 ? decodeURIComponent(url.slice(i + marker.length)) : "";
  if (path) await supabase.storage.from(BUCKET).remove([path]).catch(() => {});
}

// ── Read ──────────────────────────────────────────────────────────────────────

export async function getUnitImages(unitId: string): Promise<UnitImage[]> {
  const { data, error } = await supabase
    .from("unit_images")
    .select("*")
    .eq("unit_id", unitId)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as ImageRow[]).map(rowToImage);
}

// ── Add ───────────────────────────────────────────────────────────────────────

// Uploads the file, inserts a row, and auto-sets is_primary when it's the first image.
// Also syncs units.image_url when primary is assigned.
export async function addUnitImage(
  unitId:       string,
  file:         File,
  currentCount: number,
): Promise<UnitImage> {
  const imageUrl  = await uploadFile(file);
  const isPrimary = currentCount === 0;

  const { data, error } = await supabase
    .from("unit_images")
    .insert({ unit_id: unitId, image_url: imageUrl, sort_order: currentCount, is_primary: isPrimary })
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (isPrimary) {
    await supabase.from("units").update({ image_url: imageUrl }).eq("id", unitId);
  }

  return rowToImage(data as ImageRow);
}

// ── Delete ────────────────────────────────────────────────────────────────────

export async function deleteUnitImage(imageId: string, imageUrl: string): Promise<void> {
  const { error } = await supabase.from("unit_images").delete().eq("id", imageId);
  if (error) throw new Error(error.message);
  await removeFile(imageUrl);
}

// ── Primary ───────────────────────────────────────────────────────────────────

// Clears all is_primary flags for the unit, sets the given image as primary,
// and syncs units.image_url.
export async function setPrimaryImage(
  unitId:   string,
  imageId:  string,
  imageUrl: string,
): Promise<void> {
  await supabase.from("unit_images").update({ is_primary: false }).eq("unit_id", unitId);
  await supabase.from("unit_images").update({ is_primary: true  }).eq("id", imageId);
  await supabase.from("units").update({ image_url: imageUrl }).eq("id", unitId);
}

// Called when the last image of a unit is removed.
export async function clearPrimaryImage(unitId: string): Promise<void> {
  await supabase.from("units").update({ image_url: null }).eq("id", unitId);
}

// ── Sort Order ────────────────────────────────────────────────────────────────

// Persists the current array order as sort_order 0, 1, 2…
export async function reorderImages(images: UnitImage[]): Promise<void> {
  await Promise.all(
    images.map((img, i) =>
      supabase.from("unit_images").update({ sort_order: i }).eq("id", img.id),
    ),
  );
}

// ── Duplicate ─────────────────────────────────────────────────────────────────
// Copies every image belonging to `sourceUnitId` into new storage paths and
// inserts corresponding rows for `targetUnitId` with the same sort_order and
// is_primary values. Uses Supabase storage `copy` so no download/upload is
// needed — purely server-side within the same bucket.
// Returns the URL of the primary image (for syncing units.image_url), or null
// if the source unit has no images.

export async function duplicateUnitImages(
  sourceUnitId: string,
  targetUnitId: string,
): Promise<string | null> {
  const sourceImages = await getUnitImages(sourceUnitId);
  if (!sourceImages.length) return null;

  const MARKER = `/object/public/${BUCKET}/`;
  let primaryUrl: string | null = null;

  for (const img of sourceImages) {
    // Extract the storage path from the public URL
    const idx = img.imageUrl.indexOf(MARKER);
    if (idx < 0) continue;
    const oldPath = decodeURIComponent(img.imageUrl.slice(idx + MARKER.length));
    const ext     = oldPath.split(".").pop() ?? "jpg";
    const newPath = `${crypto.randomUUID()}.${ext}`;

    // Copy file within the same bucket — no download/re-upload required
    const { error: copyErr } = await supabase.storage.from(BUCKET).copy(oldPath, newPath);
    if (copyErr) throw new Error(copyErr.message);

    const newUrl = supabase.storage.from(BUCKET).getPublicUrl(newPath).data.publicUrl;

    // Insert image row for the new unit
    const { error: insertErr } = await supabase.from("unit_images").insert({
      unit_id:    targetUnitId,
      image_url:  newUrl,
      sort_order: img.sortOrder,
      is_primary: img.isPrimary,
    });
    if (insertErr) throw new Error(insertErr.message);

    if (img.isPrimary) primaryUrl = newUrl;
  }

  return primaryUrl;
}

// ── Replace ───────────────────────────────────────────────────────────────────

// Uploads a new file, updates the row's image_url, deletes the old file.
// Syncs units.image_url when the replaced image is the primary.
export async function replaceUnitImage(
  image:   UnitImage,
  newFile: File,
): Promise<UnitImage> {
  const newUrl = await uploadFile(newFile);

  const { data, error } = await supabase
    .from("unit_images")
    .update({ image_url: newUrl })
    .eq("id", image.id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  await removeFile(image.imageUrl);

  if (image.isPrimary) {
    await supabase.from("units").update({ image_url: newUrl }).eq("id", image.unitId);
  }

  return rowToImage(data as ImageRow);
}

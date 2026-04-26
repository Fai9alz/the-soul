// ─── The Soul — Soul Hittin Residences Data ───────────────────────────────────
// price:  SAR per year  (annual rent)
// area:   sqm
// image:  URL string | null  (null = gradient placeholder)
// ─────────────────────────────────────────────────────────────────────────────

export type UnitStatus = "Available" | "Reserved" | "Coming Soon";
export type UnitType =
  | "Studio"
  | "1 Bedroom"
  | "2 Bedrooms"
  | "3 Bedrooms"
  | "Penthouse";

export interface Unit {
  id:          string;
  name:        string;
  ref:         string;         // display reference code, e.g. "SH-001"
  type:        UnitType;
  bedrooms:    number;
  bathrooms:   number;
  area:        number;         // sqm
  floor:       number;
  price:       number;         // SAR per year (annual rent)
  status:      UnitStatus;
  description: string;
  image:       string | null;  // null = gradient placeholder
  features:    string[];
}

// ─── Soul Hittin ──────────────────────────────────────────────────────────────
// To add/edit units: update the array below.
// Pricing is annual SAR. Status: "Available" | "Reserved" | "Coming Soon".
// ─────────────────────────────────────────────────────────────────────────────

export const SOUL_HITTIN_UNITS: Unit[] = [

  // ── STUDIO ────────────────────────────────────────────────────────────────
  {
    id:          "sh-001",
    name:        "Courtyard Suite",
    ref:         "SH-001",
    type:        "Studio",
    bedrooms:    1,
    bathrooms:   1,
    area:        65,
    floor:       1,
    price:       168_000,          // SAR / year
    status:      "Available",
    description:
      "A refined single-volume studio opening onto a private courtyard garden. Designed for those who prefer clarity over excess — every surface considered, nothing superfluous.",
    image:       null,
    features:    [
      "Private courtyard garden",
      "Built-in kitchen",
      "Full-height storage",
      "Polished stone flooring",
      "Oversized glazing",
      "Reserved parking",
    ],
  },

  // ── 1 BEDROOM ─────────────────────────────────────────────────────────────
  {
    id:          "sh-101",
    name:        "The Grove",
    ref:         "SH-101",
    type:        "1 Bedroom",
    bedrooms:    1,
    bathrooms:   1,
    area:        92,
    floor:       1,
    price:       210_000,          // SAR / year
    status:      "Available",
    description:
      "Generous proportions and a shaded outdoor terrace make The Grove one of the most sought-after one-bedroom residences in the community. The living and sleeping volumes are deliberately separated by a wide threshold.",
    image:       null,
    features:    [
      "Private terrace",
      "Built-in kitchen",
      "Ensuite bathroom",
      "Fitted wardrobe",
      "Polished stone flooring",
      "Oversized glazing",
      "Reserved parking",
    ],
  },
  {
    id:          "sh-102",
    name:        "Garden Wing",
    ref:         "SH-102",
    type:        "1 Bedroom",
    bedrooms:    1,
    bathrooms:   1,
    area:        88,
    floor:       1,
    price:       198_000,          // SAR / year
    status:      "Reserved",
    description:
      "Positioned at garden level, this residence enjoys direct access to the community's landscaped grounds and shaded walkways. A quiet home for those who choose to live close to the earth.",
    image:       null,
    features:    [
      "Direct garden access",
      "Built-in kitchen",
      "Ensuite bathroom",
      "Fitted wardrobe",
      "Natural stone finishes",
      "Reserved parking",
    ],
  },

  // ── 2 BEDROOMS ────────────────────────────────────────────────────────────
  {
    id:          "sh-201",
    name:        "The Olive",
    ref:         "SH-201",
    type:        "2 Bedrooms",
    bedrooms:    2,
    bathrooms:   2,
    area:        148,
    floor:       2,
    price:       295_000,          // SAR / year
    status:      "Available",
    description:
      "The Olive combines generous living spaces with elevated views over the community's olive-planted courtyard. A considered residence for those who value quiet abundance and room enough for two lives well lived.",
    image:       null,
    features:    [
      "Private balcony",
      "Courtyard views",
      "Built-in kitchen",
      "2 ensuite bathrooms",
      "Walk-in wardrobe",
      "Laundry room",
      "Smart home system",
      "Reserved parking (2)",
    ],
  },
  {
    id:          "sh-202",
    name:        "The Terrace",
    ref:         "SH-202",
    type:        "2 Bedrooms",
    bedrooms:    2,
    bathrooms:   2,
    area:        164,
    floor:       2,
    price:       330_000,          // SAR / year
    status:      "Reserved",
    description:
      "Named for its exceptional wrap-around terrace, this two-bedroom home offers an outdoor living experience rarely found in Riyadh. The terrace extends the living area seamlessly, shaded by deep overhangs.",
    image:       null,
    features:    [
      "Wrap-around terrace",
      "Built-in kitchen",
      "2 ensuite bathrooms",
      "Walk-in wardrobe",
      "Laundry room",
      "Smart home system",
      "Reserved parking (2)",
    ],
  },

  // ── 3 BEDROOMS ────────────────────────────────────────────────────────────
  {
    id:          "sh-301",
    name:        "The Canopy",
    ref:         "SH-301",
    type:        "3 Bedrooms",
    bedrooms:    3,
    bathrooms:   3,
    area:        218,
    floor:       3,
    price:       420_000,          // SAR / year
    status:      "Available",
    description:
      "The Canopy occupies a full corner of the third floor, drawing natural light from two aspects. A home of calm authority, with room enough to live slowly and host with ease.",
    image:       null,
    features:    [
      "Corner aspect — dual outlook",
      "Private terrace",
      "Built-in kitchen",
      "3 ensuite bathrooms",
      "Walk-in wardrobes",
      "Study",
      "Smart home system",
      "Reserved parking (2)",
    ],
  },
  {
    id:          "sh-302",
    name:        "The Birch",
    ref:         "SH-302",
    type:        "3 Bedrooms",
    bedrooms:    3,
    bathrooms:   2,
    area:        196,
    floor:       3,
    price:       385_000,          // SAR / year
    status:      "Available",
    description:
      "A warm and considered three-bedroom residence with a dedicated library nook and views over the community's canopy of trees. Space for a life with depth.",
    image:       null,
    features:    [
      "Library nook",
      "Private terrace",
      "Built-in kitchen",
      "Master ensuite",
      "Guest bathroom",
      "Walk-in wardrobe",
      "Reserved parking (2)",
    ],
  },

  // ── PENTHOUSE ─────────────────────────────────────────────────────────────
  {
    id:          "sh-401",
    name:        "The Summit",
    ref:         "SH-401",
    type:        "Penthouse",
    bedrooms:    4,
    bathrooms:   4,
    area:        338,
    floor:       4,
    price:       680_000,          // SAR / year
    status:      "Coming Soon",
    description:
      "Occupying the full north wing of the top floor, The Summit is Soul Hittin's most exceptional residence. Unobstructed views, a private rooftop terrace, and a scale of living reserved for the few.",
    image:       null,
    features:    [
      "Private rooftop terrace",
      "Unobstructed city views",
      "Chef's kitchen",
      "4 ensuite bathrooms",
      "2 walk-in wardrobes",
      "Study",
      "Home cinema room",
      "Smart home system",
      "Reserved parking (3)",
      "Private lift access",
    ],
  },
  {
    id:          "sh-402",
    name:        "The Horizon",
    ref:         "SH-402",
    type:        "Penthouse",
    bedrooms:    3,
    bathrooms:   3,
    area:        295,
    floor:       4,
    price:       580_000,          // SAR / year
    status:      "Coming Soon",
    description:
      "The Horizon frames panoramic views of Riyadh from every principal room. A penthouse defined by light, proportion, and the stillness that only elevation brings.",
    image:       null,
    features:    [
      "Panoramic city views",
      "Private terrace",
      "Chef's kitchen",
      "3 ensuite bathrooms",
      "Walk-in wardrobe",
      "Study",
      "Smart home system",
      "Reserved parking (2)",
      "Private lift access",
    ],
  },
];

// Legacy alias — used by Residences.tsx (kept for compatibility)
export const UNITS = SOUL_HITTIN_UNITS;

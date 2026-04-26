// ─── The Soul — Riyadh Map Location Data ─────────────────────────────────────
// Coordinates: [longitude, latitude] — GeoJSON / Mapbox order.
// image:       URL string, or null while placeholder is used.
// description: One-sentence summary shown in the popup card.
// ─────────────────────────────────────────────────────────────────────────────

export type Category =
  | "project"
  | "school"
  | "landmark"
  | "business"
  | "shopping"
  | "transit";

export interface Place {
  id:          string;
  name:        string;
  category:    Category;
  coordinates: [number, number]; // [longitude, latitude]
  area?:       string;
  note?:       string;
  image:       string | null;    // null = show placeholder until real photo added
  description: string;
}

export const PLACES: Place[] = [

  // ── PROJECT ───────────────────────────────────────────────────────────────
  {
    id:          "soul-hittin",
    name:        "Soul Hittin",
    category:    "project",
    coordinates: [46.587056, 24.784167],
    area:        "Hittin",
    note:        "Flagship",
    image:       null, // replace with real photo URL
    description: "A curated long-term living community designed for those who live with intention.",
  },
  {
    id:          "soul-al-wadi",
    name:        "Soul Al Wadi",
    category:    "project",
    coordinates: [46.697953, 24.793393],
    area:        "Al Wadi",
    note:        "Coming Soon",
    image:       null, // replace with real photo URL
    description: "Premium residences extending the Soul lifestyle into the serene Al Wadi neighbourhood.",
  },

  // ── SCHOOL ────────────────────────────────────────────────────────────────
  {
    id:          "school-al-wadi",
    name:        "International School",
    category:    "school",
    coordinates: [46.683056, 24.801389],
    area:        "Al Wadi",
    image:       null,
    description: "A leading international curriculum school minutes from both Soul communities.",
  },
  {
    id:          "school-al-malqa",
    name:        "International School",
    category:    "school",
    coordinates: [46.603333, 24.814722],
    area:        "Al Malqa",
    image:       null,
    description: "A highly regarded school serving Riyadh's established northern neighbourhoods.",
  },
  {
    id:          "school-diriyah",
    name:        "International School",
    category:    "school",
    coordinates: [46.577778, 24.735556],
    area:        "Diriyah",
    image:       null,
    description: "International education set alongside Riyadh's most historic district.",
  },

  // ── LANDMARK ──────────────────────────────────────────────────────────────
  {
    id:          "landmark-hittin-1",
    name:        "Attraction",
    category:    "landmark",
    coordinates: [46.587778, 24.804167],
    area:        "Hittin",
    image:       null,
    description: "A cultural destination that adds depth and character to daily life in Hittin.",
  },
  {
    id:          "landmark-hittin-2",
    name:        "Attraction",
    category:    "landmark",
    coordinates: [46.590000, 24.806389],
    area:        "Hittin",
    image:       null,
    description: "A local landmark enriching the fabric of the surrounding community.",
  },
  {
    id:          "landmark-diriyah",
    name:        "Attraction",
    category:    "landmark",
    coordinates: [46.574000, 24.735000],
    area:        "Diriyah",
    image:       null,
    description: "A gateway to Riyadh's rich heritage, steps from the historic Diriyah district.",
  },

  // ── BUSINESS ──────────────────────────────────────────────────────────────
  {
    id:          "business-hub",
    name:        "Business Hub",
    category:    "business",
    coordinates: [46.738056, 24.774722],
    image:       null,
    description: "A modern business district easily accessible from both Soul communities.",
  },

  // ── SHOPPING ──────────────────────────────────────────────────────────────
  {
    id:          "mall",
    name:        "Mall",
    category:    "shopping",
    coordinates: [46.709444, 24.766889],
    image:       null,
    description: "Contemporary retail and dining, a short drive from Soul Hittin.",
  },

];

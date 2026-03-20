export const LOCATIONS = ["seoul", "anyang"] as const;

export type PlaceLocation = (typeof LOCATIONS)[number];

export const LOCATION_LABEL: Record<PlaceLocation, string> = {
  seoul: "서울",
  anyang: "안양",
};

export const LOCATION_BG: Record<PlaceLocation, string> = {
  seoul: "/image.jpg",
  anyang: "/alley.jpg",
};

export function isPlaceLocation(v: unknown): v is PlaceLocation {
  return typeof v === "string" && (LOCATIONS as readonly string[]).includes(v);
}

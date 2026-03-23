import type { CigaretteBrand } from "@/lib/cigarette-brands";
import type { PlaceLocation } from "@/lib/locations";

export type ButtPosition = {
  id: string;
  location: PlaceLocation;
  pos_x: number;
  pos_y: number;
  rotation: number;
  brand: CigaretteBrand;
  warm_until: string | null;
};

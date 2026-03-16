export type HousingType = "apartment" | "officetel";

export type ScopeItem =
  | "living_room"
  | "kitchen"
  | "bedroom"
  | "bathroom"
  | "entrance"
  | "balcony";

export type MaterialCategory =
  | "floor"
  | "wall"
  | "kitchen_top"
  | "kitchen_door"
  | "bath_tile"
  | "bath_sink"
  | "bath_shower"
  | "kitchen_faucet"
  | "lighting";

export interface ProjectInput {
  address: string;
  detailAddress?: string;
  housingType: HousingType;
  areaPyeong: number;
  scope: ScopeItem[];
  notes?: string;
}
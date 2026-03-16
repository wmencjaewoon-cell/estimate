export type HousingType = "apartment" | "officetel";

export type RoomType = "living_room" | "kitchen" | "bathroom";

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
  | "lighting"
  | "ceiling_fan"
  | "air_conditioner"
  | "flooring"
  | "wiring_accessory"
  | "vinyl_flooring"
  | "wood";

export interface SelectedMaterial {
  roomType: string;
  category: MaterialCategory;
  materialId: string;
  productName: string;
  brand: string;
  unit: string;
  unitPrice: number;
  shortDesc: string;
  previewStyleKey: string;
}

export interface EstimateLineItem {
  label: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  lineType: string;
}

export interface EstimateResult {
  materialTotal: number;
  laborTotal: number;
  demolitionTotal: number;
  etcTotal: number;
  total: number;
  lineItems: EstimateLineItem[];
}

export type Material = {
  id: string;
  category: string;
  subcategory?: string | null;
  brand?: string | null;
  product_name: string;
  specification?: string | null;
  color?: string | null;
  unit: string;
  default_unit_price: number;
  vendor_name?: string | null;
  is_active: boolean;
  note?: string | null;
  spec_json?: Record<string, any> | null;
  image_path?: string | null;
  thumbnail_path?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type MaterialFormInput = {
  category: string;
  subcategory?: string;
  brand?: string;
  product_name: string;
  specification?: string;
  color?: string;
  unit: string;
  default_unit_price: number;
  vendor_name?: string;
  note?: string;
  spec_json?: Record<string, any>;
  image_path?: string;
  thumbnail_path?: string;
};

export type EstimateItem = {
  id?: string;
  material_id?: string | null;
  work_name: string;
  detail_name?: string;
  product_name?: string;
  unit: string;
  quantity: number;
  material_unit_price: number;
  labor_unit_price: number;
  install_unit_price: number;
  unit_price: number;
  amount: number;
  note?: string;
};

export type EstimateTotals = {
  subtotal: number;
  profitAmount: number;
  total: number;
};
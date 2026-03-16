import { supabase } from "@/lib/supabase/client";
import type { Material, MaterialFormInput } from "@/types";


export async function fetchMaterials(params?: {
  category?: string;
  keyword?: string;
  onlyActive?: boolean;
}) {
  let query = supabase
    .from("material_master")
    .select("*")
    .order("category", { ascending: true })
    .order("product_name", { ascending: true });

  if (params?.onlyActive !== false) {
    query = query.eq("is_active", true);
  }

  if (params?.category) {
    query = query.eq("category", params.category);
  }

  if (params?.keyword) {
    query = query.ilike("product_name", `%${params.keyword}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Material[];
}

export async function createMaterial(input: MaterialFormInput) {
  const payload = {
    category: input.category.trim(),
    subcategory: input.subcategory?.trim() || null,
    brand: input.brand?.trim() || null,
    product_name: input.product_name.trim(),
    specification: input.specification?.trim() || null,
    color: input.color?.trim() || null,
    unit: input.unit.trim(),
    default_unit_price: Number(input.default_unit_price) || 0,
    vendor_name: input.vendor_name?.trim() || null,
    note: input.note?.trim() || null,
    spec_json: input.spec_json ?? {},
    image_path: input.image_path ?? null,
    thumbnail_path: input.thumbnail_path ?? null,
    is_active: true,
  };

  const { data, error } = await supabase
    .from("material_master")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Material;
}

export async function updateMaterial(id: string, input: MaterialFormInput) {
  const payload = {
    category: input.category.trim(),
    subcategory: input.subcategory?.trim() || null,
    brand: input.brand?.trim() || null,
    product_name: input.product_name.trim(),
    specification: input.specification?.trim() || null,
    color: input.color?.trim() || null,
    unit: input.unit.trim(),
    default_unit_price: Number(input.default_unit_price) || 0,
    vendor_name: input.vendor_name?.trim() || null,
    note: input.note?.trim() || null,
    spec_json: input.spec_json ?? {},
    image_path: input.image_path ?? null,
    thumbnail_path: input.thumbnail_path ?? null,
  };

  const { data, error } = await supabase
    .from("material_master")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Material;
}

export async function toggleMaterialActive(id: string, isActive: boolean) {
  const { error } = await supabase
    .from("material_master")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteMaterial(id: string) {
  const { error } = await supabase
    .from("material_master")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function uploadMaterialImage(file: File, materialId: string) {
  const ext = file.name.split(".").pop() || "jpg";
  const filePath = `${materialId}/main.${ext}`;

  const { error } = await supabase.storage
    .from("material-images")
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type || "image/jpeg",
    });

  if (error) {
    throw new Error(error.message);
  }

  return filePath;
}

export function getMaterialImageUrl(path?: string | null) {
  if (!path) return "";

  const { data } = supabase.storage
    .from("material-images")
    .getPublicUrl(path);

  return data.publicUrl;
}
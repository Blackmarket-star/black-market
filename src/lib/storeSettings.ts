import type { StoreSettings } from "@/types";
import { supabase } from "@/lib/supabase";

export const EMPTY_STORE_SETTINGS: StoreSettings = {
  province: "",
  city: "",
  address: "",
  latitude: null,
  longitude: null,
};

export async function fetchStoreSettings(): Promise<StoreSettings> {
  const { data, error } = await supabase
    .from("store_settings")
    .select("province, city, address, latitude, longitude")
    .eq("id", "main")
    .maybeSingle();

  if (error) throw error;
  if (!data) return EMPTY_STORE_SETTINGS;

  return {
    province: data.province ?? "",
    city: data.city ?? "",
    address: data.address ?? "",
    latitude: data.latitude,
    longitude: data.longitude,
  };
}

export async function saveStoreSettings(settings: StoreSettings): Promise<void> {
  const { error } = await supabase.from("store_settings").upsert({
    id: "main",
    province: settings.province,
    city: settings.city,
    address: settings.address,
    latitude: settings.latitude,
    longitude: settings.longitude,
    updated_at: new Date().toISOString(),
  });

  if (error) throw error;
}

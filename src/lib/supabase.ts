import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ?? "https://vlbxbwwidazjptlbjdfj.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ?? "sb_publishable_vV0csoq7hl29451k8swbyg_7ihPd_";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

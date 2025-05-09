import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl: string | undefined = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey: string | undefined = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Este error se lanzará si las variables no están cargadas correctamente
  throw new Error("Supabase URL or Anon Key is missing. Check your .env file and restart the Vite server.");
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Exportar el tipo Profile aquí también puede ser útil para otros módulos
export type { Profile } from '@/context/AuthContext'; // Asumiendo que Profile está definido en AuthContext
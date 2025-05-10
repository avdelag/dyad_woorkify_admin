import { createClient, SupabaseClient } from '@supabase/supabase-js';

console.log("[SupabaseClient] Initializing Supabase client...");

const supabaseUrl: string | undefined = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey: string | undefined = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("[SupabaseClient] VITE_SUPABASE_URL:", supabaseUrl ? "Loaded" : "MISSING!");
console.log("[SupabaseClient] VITE_SUPABASE_ANON_KEY:", supabaseAnonKey ? "Loaded" : "MISSING!");

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage = "Supabase URL or Anon Key is missing. Check your .env file (ensure it's in the root of your project and named correctly, e.g., .env.local or .env) and restart the Vite server. Variables expected: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY.";
  console.error("[SupabaseClient] CRITICAL ERROR:", errorMessage);
  // Mostrar el error en la UI podría ser útil si la consola no es visible fácilmente
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `<div style="color: red; padding: 20px; font-family: sans-serif; background-color: #fff0f0; border: 1px solid red;">
      <h2>Supabase Configuration Error</h2>
      <p>${errorMessage}</p>
      <p>Please check the browser console for more details and ensure your environment variables are correctly set up.</p>
    </div>`;
  }
  throw new Error(errorMessage);
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);
console.log("[SupabaseClient] Supabase client instance created:", supabase ? "Success" : "Failed");

// Exportar el tipo Profile aquí también puede ser útil para otros módulos
export type { Profile } from '@/context/AuthContext'; // Asumiendo que Profile está definido en AuthContext
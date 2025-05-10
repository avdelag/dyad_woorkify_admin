"use client";
import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
// import { Loading } from "@/components/Loading"; // No se renderizará Loading desde aquí

export interface Profile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  is_admin?: boolean;
  // Añade otros campos del perfil según sea necesario
  created_at: string; // Añadido para consistencia con datos de Supabase
  business_name?: string;
  business_description?: string;
  email?: string; // El email también puede estar en el perfil
}

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    if (!userId) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) {
        console.error("Error fetching profile:", error.message);
        return null;
      }
      return data as Profile;
    } catch (e) {
      console.error("Exception fetching profile:", e);
      return null;
    }
  }, []);

  useEffect(() => {
    setIsLoading(true); // Iniciar carga al montar o si fetchProfile cambia (no debería)

    // Carga inicial de la sesión y perfil
    const bootstrapAuth = async () => {
      const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Error getting initial session:", sessionError.message);
        // No establecer isLoading a false aquí todavía, el listener lo hará o el final de esta función.
      }
      
      setSession(initialSession);
      const activeUser = initialSession?.user ?? null;
      setUser(activeUser);

      if (activeUser) {
        const userProfile = await fetchProfile(activeUser.id);
        setProfile(userProfile);
        setIsAdmin(userProfile?.is_admin === true);
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
      setIsLoading(false); // Finalizar carga inicial después de obtener sesión y perfil
    };

    bootstrapAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        console.log('Auth state change:', _event, currentSession);
        
        // Si el evento es uno que requiere recargar el perfil, marcamos isLoading.
        if (_event === 'SIGNED_IN' || _event === 'USER_UPDATED') {
          setIsLoading(true);
        }
        
        setSession(currentSession);
        const activeUser = currentSession?.user ?? null;
        setUser(activeUser);

        if (activeUser) {
          // Recargar perfil si el usuario cambió, o si es un evento de inicio de sesión/actualización.
          // O si el perfil actual no existe y debería.
          const currentProfileId = profile?.id; // Capturar el ID del perfil actual antes de cualquier cambio
          if (_event === 'SIGNED_IN' || _event === 'USER_UPDATED' || currentProfileId !== activeUser.id) {
            const userProfile = await fetchProfile(activeUser.id);
            setProfile(userProfile);
            setIsAdmin(userProfile?.is_admin === true);
          }
        } else {
          setProfile(null);
          setIsAdmin(false);
        }
        
        // Asegurarse de que isLoading se ponga a false después de procesar el evento,
        // especialmente para SIGNED_IN, SIGNED_OUT, USER_UPDATED.
        // INITIAL_SESSION es manejado por bootstrapAuth.
        if (_event === 'SIGNED_IN' || _event === 'SIGNED_OUT' || _event === 'USER_UPDATED') {
          setIsLoading(false);
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [fetchProfile]); // Solo depende de fetchProfile, que es estable.

  const signOut = async () => {
    setIsLoading(true); 
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
      setIsLoading(false); // Asegurar que isLoading se ponga a false si hay error en signOut
    }
    // El listener onAuthStateChange se encargará de actualizar el estado y isLoading a false.
  };
  
  // El AuthProvider ya no renderiza <Loading />.
  // Los consumidores (como ProtectedRoute) usarán el estado `isLoading` del contexto.
  return (
    <AuthContext.Provider value={{ session, user, profile, isAdmin, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider from the correct AuthContext.tsx");
  }
  return context;
};
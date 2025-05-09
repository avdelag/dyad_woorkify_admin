"use client";
import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Loading } from "@/components/Loading";

export interface Profile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  is_admin?: boolean;
  // Añade otros campos del perfil según sea necesario
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

  const fetchProfile = useCallback(async (userId: string) => {
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
    const getSessionAndProfile = async () => {
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Error getting session:", sessionError.message);
        setIsLoading(false);
        return;
      }

      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        const userProfile = await fetchProfile(currentSession.user.id);
        setProfile(userProfile);
        setIsAdmin(userProfile?.is_admin === true);
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
      setIsLoading(false);
    };

    getSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        if (currentSession?.user) {
          // Solo volvemos a buscar el perfil si el usuario ha cambiado realmente o es un evento de SIGNED_IN
          if (_event === 'SIGNED_IN' || (_event === 'USER_UPDATED' && user?.id !== currentSession.user.id)) {
            const userProfile = await fetchProfile(currentSession.user.id);
            setProfile(userProfile);
            setIsAdmin(userProfile?.is_admin === true);
          } else if (_event === 'USER_UPDATED' && profile?.id === currentSession.user.id) {
            // Si es una actualización del mismo usuario, podríamos querer refrescar el perfil
            const userProfile = await fetchProfile(currentSession.user.id);
            setProfile(userProfile);
            setIsAdmin(userProfile?.is_admin === true);
          }
        } else {
          setProfile(null);
          setIsAdmin(false);
        }
        // Evitar que isLoading se ponga en true innecesariamente en cada cambio de estado
        if (_event === 'INITIAL_SESSION' || _event === 'SIGNED_IN' || _event === 'SIGNED_OUT') {
          setIsLoading(false);
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [fetchProfile, user, profile]); // Añadidas dependencias user y profile

  const signOut = async () => {
    setIsLoading(true); // Indicar carga durante el cierre de sesión
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error.message);
      // El estado de isLoading se manejará por onAuthStateChange o se puede poner a false aquí si es necesario
    }
    // setSession, setUser, setProfile, setIsAdmin se actualizarán a través de onAuthStateChange
  };
  
  // Mostrar carga solo en la carga inicial si no hay sesión, o si explícitamente estamos cargando (ej. durante signOut)
  if (isLoading && session === null && !user) { 
    return <Loading />;
  }

  return (
    <AuthContext.Provider value={{ session, user, profile, isAdmin, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) { // Esta es la línea que lanza el error
    throw new Error("useAuth must be used within an AuthProvider from the correct AuthContext.tsx");
  }
  return context;
};
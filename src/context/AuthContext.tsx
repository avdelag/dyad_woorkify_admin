"use client";
import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface Profile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  is_admin?: boolean;
  created_at: string;
  business_name?: string;
  business_description?: string;
  email?: string;
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
  const [_isLoading, _setIsLoading] = useState(true); // Renombrado para loggear cambios

  // Wrapper para setIsLoading para loggear cambios
  const setIsLoading = (loadingState: boolean) => {
    console.log(`[AuthContext] setIsLoading called. New state: ${loadingState}`);
    _setIsLoading(loadingState);
  };
  const isLoading = _isLoading; // Mantener el nombre original para el consumidor

  console.log("[AuthContext] Provider rendering. Initial isLoading:", isLoading);

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    console.log(`[AuthContext] fetchProfile called for userId: ${userId}`);
    if (!userId) {
      console.log("[AuthContext] fetchProfile: No userId provided, returning null.");
      return null;
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) {
        console.error("[AuthContext] fetchProfile: Error fetching profile:", error.message);
        return null;
      }
      console.log("[AuthContext] fetchProfile: Profile data fetched:", data);
      return data as Profile;
    } catch (e) {
      console.error("[AuthContext] fetchProfile: Exception fetching profile:", e);
      return null;
    }
  }, []);

  useEffect(() => {
    console.log("[AuthContext] Main useEffect triggered. Setting isLoading to true.");
    setIsLoading(true);

    const bootstrapAuth = async () => {
      console.log("[AuthContext] bootstrapAuth: Starting...");
      const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("[AuthContext] bootstrapAuth: Error getting initial session:", sessionError.message);
      } else {
        console.log("[AuthContext] bootstrapAuth: Initial session data:", initialSession);
      }
      
      setSession(initialSession);
      const activeUser = initialSession?.user ?? null;
      setUser(activeUser);
      console.log("[AuthContext] bootstrapAuth: Active user set:", activeUser);

      if (activeUser) {
        console.log(`[AuthContext] bootstrapAuth: Active user found (ID: ${activeUser.id}). Fetching profile...`);
        const userProfile = await fetchProfile(activeUser.id);
        setProfile(userProfile);
        setIsAdmin(userProfile?.is_admin === true);
        console.log("[AuthContext] bootstrapAuth: Profile set:", userProfile, "IsAdmin:", userProfile?.is_admin === true);
      } else {
        console.log("[AuthContext] bootstrapAuth: No active user. Setting profile to null and isAdmin to false.");
        setProfile(null);
        setIsAdmin(false);
      }
      console.log("[AuthContext] bootstrapAuth: Finished. Setting isLoading to false.");
      setIsLoading(false);
    };

    bootstrapAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        console.log(`[AuthContext] onAuthStateChange: Event: ${_event}, Current session:`, currentSession);
        
        if (_event === 'SIGNED_IN' || _event === 'USER_UPDATED') {
          console.log(`[AuthContext] onAuthStateChange: Event is ${_event}. Setting isLoading to true.`);
          setIsLoading(true);
        }
        
        setSession(currentSession);
        const activeUser = currentSession?.user ?? null;
        setUser(activeUser);
        console.log("[AuthContext] onAuthStateChange: Active user set:", activeUser);

        if (activeUser) {
          const currentProfileId = profile?.id;
          console.log(`[AuthContext] onAuthStateChange: Active user found (ID: ${activeUser.id}). Current profile ID: ${currentProfileId}.`);
          if (_event === 'SIGNED_IN' || _event === 'USER_UPDATED' || currentProfileId !== activeUser.id) {
            console.log("[AuthContext] onAuthStateChange: Fetching/refreshing profile...");
            const userProfile = await fetchProfile(activeUser.id);
            setProfile(userProfile);
            setIsAdmin(userProfile?.is_admin === true);
            console.log("[AuthContext] onAuthStateChange: Profile set:", userProfile, "IsAdmin:", userProfile?.is_admin === true);
          } else {
            console.log("[AuthContext] onAuthStateChange: Profile up-to-date, not re-fetching.");
          }
        } else {
          console.log("[AuthContext] onAuthStateChange: No active user. Setting profile to null and isAdmin to false.");
          setProfile(null);
          setIsAdmin(false);
        }
        
        if (_event === 'SIGNED_IN' || _event === 'SIGNED_OUT' || _event === 'USER_UPDATED') {
          console.log(`[AuthContext] onAuthStateChange: Event is ${_event}. Setting isLoading to false.`);
          setIsLoading(false);
        }
      }
    );

    return () => {
      console.log("[AuthContext] Main useEffect cleanup: Unsubscribing auth listener.");
      authListener?.subscription?.unsubscribe();
    };
  }, [fetchProfile, profile]); // Añadido profile a las dependencias para re-evaluar si el perfil cambia externamente (aunque fetchProfile es useCallback)

  const signOut = async () => {
    console.log("[AuthContext] signOut called. Setting isLoading to true.");
    setIsLoading(true); 
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("[AuthContext] signOut: Error signing out:", error.message);
      console.log("[AuthContext] signOut: Error occurred. Setting isLoading to false.");
      setIsLoading(false);
    } else {
      console.log("[AuthContext] signOut: Successful. Auth listener will handle state updates and isLoading.");
    }
  };
  
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
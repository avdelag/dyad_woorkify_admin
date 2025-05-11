"use client";
import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface Profile {
  id: string;
  full_name?: string;
  avatar_url?: string;
  is_admin?: boolean; // Este es el campo clave
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
  const [_isLoading, _setIsLoading] = useState(true);

  const setIsLoading = (loadingState: boolean, from: string) => {
    console.log(`[AuthContext] setIsLoading called from "${from}". New state: ${loadingState}`);
    _setIsLoading(loadingState);
  };
  const isLoading = _isLoading;

  console.log("[AuthContext] Provider rendering. Initial isLoading:", isLoading);

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    console.log(`[AuthContext] fetchProfile called for userId: ${userId}`);
    if (!userId) {
      console.warn("[AuthContext] fetchProfile: No userId provided, returning null.");
      return null;
    }
    try {
      const { data, error, status } = await supabase
        .from('profiles') // Consultando la tabla 'profiles'
        .select('*')
        .eq('id', userId)
        .single();

      if (error && status !== 406) { 
        console.error("[AuthContext] fetchProfile: Error fetching profile:", error.message, "Status:", status);
        return null;
      }
      if (!data) {
        console.log("[AuthContext] fetchProfile: No profile data found for user (userId:", userId,"). This might be normal for new users or if the ID doesn't match.");
        return null;
      }
      console.log("[AuthContext] fetchProfile: Profile data fetched for userId:", userId, "Data:", data);
      return data as Profile;
    } catch (e: any) {
      console.error("[AuthContext] fetchProfile: Exception fetching profile for userId:", userId, "Error:", e.message);
      return null;
    }
  }, []);

  useEffect(() => {
    setIsLoading(true, "Main useEffect start");

    const bootstrapAuth = async () => {
      console.log("[AuthContext] bootstrapAuth: Starting...");
      try {
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
          const userProfile = await fetchProfile(activeUser.id);
          setProfile(userProfile);
          // Verifica userProfile y userProfile.is_admin
          const adminStatus = userProfile?.is_admin === true;
          setIsAdmin(adminStatus);
          console.log("[AuthContext] bootstrapAuth: Profile processed. UserProfile:", userProfile, "IsAdmin flag from profile:", userProfile?.is_admin, "Calculated isAdmin:", adminStatus);
        } else {
          setProfile(null);
          setIsAdmin(false);
          console.log("[AuthContext] bootstrapAuth: No active user. Profile and isAdmin reset.");
        }
      } catch (error: any) {
        console.error("[AuthContext] bootstrapAuth: Exception during bootstrap:", error.message);
      } finally {
        setIsLoading(false, "bootstrapAuth finally");
      }
    };

    bootstrapAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        console.log(`[AuthContext] onAuthStateChange: Event: ${_event}, Current session:`, currentSession);
        
        if (_event === 'SIGNED_IN' || _event === 'USER_UPDATED') {
          setIsLoading(true, `onAuthStateChange ${_event} start`);
        }

        try {
          setSession(currentSession);
          const activeUser = currentSession?.user ?? null;
          setUser(activeUser);

          if (activeUser) {
            if (_event === 'SIGNED_IN' || _event === 'USER_UPDATED' || (profile?.id !== activeUser.id)) {
              console.log(`[AuthContext] onAuthStateChange: Fetching profile for user ${activeUser.id} due to event ${_event} or user change.`);
              const userProfile = await fetchProfile(activeUser.id);
              setProfile(userProfile);
              const adminStatus = userProfile?.is_admin === true; // Verifica userProfile y userProfile.is_admin
              setIsAdmin(adminStatus);
              console.log("[AuthContext] onAuthStateChange: Profile processed. UserProfile:", userProfile, "IsAdmin flag from profile:", userProfile?.is_admin, "Calculated isAdmin:", adminStatus);
            } else {
               console.log(`[AuthContext] onAuthStateChange: Profile for user ${activeUser.id} likely up-to-date, not re-fetching for event ${_event}.`);
            }
          } else { 
            setProfile(null);
            setIsAdmin(false);
            console.log("[AuthContext] onAuthStateChange: No active user (event: SIGNED_OUT or similar). Profile and isAdmin reset.");
          }
        } catch (error: any) {
            console.error(`[AuthContext] onAuthStateChange: Error processing event ${_event}:`, error.message);
        } finally {
            if (_event === 'SIGNED_IN' || _event === 'USER_UPDATED' || _event === 'SIGNED_OUT') {
              setIsLoading(false, `onAuthStateChange ${_event} finally`);
            }
        }
      }
    );

    return () => {
      console.log("[AuthContext] Main useEffect cleanup: Unsubscribing auth listener.");
      authListener?.subscription?.unsubscribe();
    };
  }, [fetchProfile]);

  const signOut = async () => {
    setIsLoading(true, "signOut start"); 
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error("[AuthContext] signOut: Error signing out:", error.message);
          setIsLoading(false, "signOut error fallback"); 
        } else {
          console.log("[AuthContext] signOut: Successful. onAuthStateChange will handle SIGNED_OUT.");
        }
    } catch (error: any) {
        console.error("[AuthContext] signOut: Exception during sign out:", error.message);
        setIsLoading(false, "signOut exception fallback");
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
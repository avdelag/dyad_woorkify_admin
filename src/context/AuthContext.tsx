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
  const [_isLoading, _setIsLoading] = useState(true);

  // Wrapper to log isLoading changes
  const setIsLoading = (loadingState: boolean, from: string) => {
    console.log(`[AuthContext] setIsLoading called from "${from}". New state: ${loadingState}`);
    _setIsLoading(loadingState);
  };
  const isLoading = _isLoading; // Expose the original isLoading name

  console.log("[AuthContext] Provider rendering. Initial isLoading:", isLoading);

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    console.log(`[AuthContext] fetchProfile called for userId: ${userId}`);
    if (!userId) {
      console.log("[AuthContext] fetchProfile: No userId provided, returning null.");
      return null;
    }
    try {
      const { data, error, status } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && status !== 406) { // 406 means single() found 0 rows, which is not an "error" for profile fetching if user just signed up
        console.error("[AuthContext] fetchProfile: Error fetching profile:", error.message);
        return null;
      }
      if (!data) {
        console.log("[AuthContext] fetchProfile: No profile data found for user (this might be normal for new users).");
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
          setIsAdmin(userProfile?.is_admin === true);
        } else {
          setProfile(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("[AuthContext] bootstrapAuth: Exception during bootstrap:", error);
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
            // Only fetch profile if it's a relevant event or if user changed
            if (_event === 'SIGNED_IN' || _event === 'USER_UPDATED' || (profile?.id !== activeUser.id)) {
              console.log(`[AuthContext] onAuthStateChange: Fetching profile for user ${activeUser.id} due to event ${_event} or user change.`);
              const userProfile = await fetchProfile(activeUser.id);
              setProfile(userProfile);
              setIsAdmin(userProfile?.is_admin === true);
              console.log("[AuthContext] onAuthStateChange: Profile set:", userProfile, "IsAdmin:", userProfile?.is_admin === true);
            } else {
               console.log(`[AuthContext] onAuthStateChange: Profile for user ${activeUser.id} likely up-to-date, not re-fetching for event ${_event}.`);
            }
          } else { // No active user / SIGNED_OUT
            setProfile(null);
            setIsAdmin(false);
          }
        } catch (error) {
            console.error(`[AuthContext] onAuthStateChange: Error processing event ${_event}:`, error);
        } finally {
            // CRITICAL: Ensure isLoading is set to false after processing events
            // that might have set it to true (SIGNED_IN, USER_UPDATED) or after SIGNED_OUT.
            if (_event === 'SIGNED_IN' || _event === 'USER_UPDATED' || _event === 'SIGNED_OUT') {
              setIsLoading(false, `onAuthStateChange ${_event} finally`);
            }
            // For INITIAL_SESSION, bootstrapAuth's finally block handles it.
            // For TOKEN_REFRESHED or PASSWORD_RECOVERY, isLoading might not have been set to true,
            // but if it was, this ensures it's reset. Consider if these events need explicit true/false.
            // For now, focusing on SIGNED_IN.
        }
      }
    );

    return () => {
      console.log("[AuthContext] Main useEffect cleanup: Unsubscribing auth listener.");
      authListener?.subscription?.unsubscribe();
    };
  }, [fetchProfile]); // fetchProfile is stable due to useCallback

  const signOut = async () => {
    setIsLoading(true, "signOut start"); 
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error("[AuthContext] signOut: Error signing out:", error.message);
          // If signOut fails, we might still be in a loading state if onAuthStateChange doesn't fire
          setIsLoading(false, "signOut error fallback"); 
        } else {
          console.log("[AuthContext] signOut: Successful. onAuthStateChange will handle SIGNED_OUT.");
        }
    } catch (error) {
        console.error("[AuthContext] signOut: Exception during sign out:", error);
        setIsLoading(false, "signOut exception fallback");
    }
    // Note: onAuthStateChange for SIGNED_OUT should set isLoading to false.
    // The fallbacks above are just in case.
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
    // This specific error message is important for Dyad to recognize if the wrong AuthProvider is used.
    throw new Error("useAuth must be used within an AuthProvider from the correct AuthContext.tsx");
  }
  return context;
};
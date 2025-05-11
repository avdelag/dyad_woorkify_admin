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

  const setIsLoading = (loadingState: boolean, from: string) => {
    console.log(`[AuthContext] setIsLoading called from "${from}". New state: ${loadingState}`);
    _setIsLoading(loadingState);
  };
  const isLoading = _isLoading;

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
      } catch (error) {
        console.error("[AuthContext] bootstrapAuth: Exception during bootstrap:", error);
      } finally {
        console.log("[AuthContext] bootstrapAuth: Finished. Setting isLoading to false.");
        setIsLoading(false, "bootstrapAuth finally");
      }
    };

    bootstrapAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        console.log(`[AuthContext] onAuthStateChange: Event: ${_event}, Current session:`, currentSession);
        
        // Set loading to true for events that will involve async operations like profile fetching
        if (_event === 'SIGNED_IN' || _event === 'USER_UPDATED') {
          setIsLoading(true, `onAuthStateChange ${_event} start`);
        }

        try {
          setSession(currentSession);
          const activeUser = currentSession?.user ?? null;
          setUser(activeUser);
          console.log("[AuthContext] onAuthStateChange: Active user set:", activeUser);

          if (activeUser) {
            const currentProfileId = profile?.id; // Get current profile ID before potential fetch
            console.log(`[AuthContext] onAuthStateChange: Active user (ID: ${activeUser.id}). Current profile ID: ${currentProfileId}. Event: ${_event}`);
            // Fetch profile if:
            // 1. It's a SIGNED_IN event (always fetch on new sign-in)
            // 2. It's a USER_UPDATED event (user data might have changed)
            // 3. The active user ID is different from the current profile ID (user switched without full sign-out/sign-in cycle, rare)
            if (_event === 'SIGNED_IN' || _event === 'USER_UPDATED' || (activeUser.id !== currentProfileId)) {
              console.log("[AuthContext] onAuthStateChange: Fetching/refreshing profile...");
              const userProfile = await fetchProfile(activeUser.id);
              setProfile(userProfile);
              setIsAdmin(userProfile?.is_admin === true);
              console.log("[AuthContext] onAuthStateChange: Profile set:", userProfile, "IsAdmin:", userProfile?.is_admin === true);
            } else {
              console.log("[AuthContext] onAuthStateChange: Profile likely up-to-date, not re-fetching for this event.");
            }
          } else { // No active user
            console.log("[AuthContext] onAuthStateChange: No active user. Setting profile to null and isAdmin to false.");
            setProfile(null);
            setIsAdmin(false);
          }
        } catch (error) {
            console.error(`[AuthContext] onAuthStateChange: Error processing event ${_event}:`, error);
        } finally {
            // Always set isLoading to false after processing events that might have set it to true
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
  // Removed `profile` from dependencies to prevent re-runs just because profile object reference changes.
  // `fetchProfile` is stable. The logic inside onAuthStateChange now explicitly decides when to re-fetch.
  }, [fetchProfile]); 

  const signOut = async () => {
    setIsLoading(true, "signOut start"); 
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.error("[AuthContext] signOut: Error signing out:", error.message);
        } else {
          console.log("[AuthContext] signOut: Successful.");
          // onAuthStateChange will handle setting states and isLoading to false for SIGNED_OUT
        }
    } catch (error) {
        console.error("[AuthContext] signOut: Exception during sign out:", error);
    } finally {
        // Ensure isLoading is false if onAuthStateChange doesn't fire or if there's an early error.
        // However, onAuthStateChange for SIGNED_OUT should be the primary place.
        // This is a safeguard.
        if (user === null && session === null) { // If already signed out by the time this runs
             setIsLoading(false, "signOut finally (already signed out)");
        }
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
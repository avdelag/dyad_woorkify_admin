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

  const setIsLoading = (loading: boolean, from: string) => {
    console.log(`[AuthContext] setIsLoading from "${from}": ${loading}`);
    _setIsLoading(loading);
  };
  const isLoading = _isLoading;

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    if (!userId) return null;
    try {
      const { data, error, status } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error && status !== 406) {
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
    setIsLoading(true, "useEffect start");

    const bootstrapAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
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
      } catch (error) {
        console.error("BootstrapAuth Error:", error);
      } finally {
        setIsLoading(false, "useEffect finally");
      }
    };

    bootstrapAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        console.log("Auth Event:", _event);
        if (_event === "SIGNED_IN" || _event === "USER_UPDATED") {
          setIsLoading(true, `Event ${_event} start`);
        }

        try {
          setSession(currentSession);
          const activeUser = currentSession?.user ?? null;
          setUser(activeUser);

          if (activeUser) {
            const userProfile = await fetchProfile(activeUser.id);
            setProfile(userProfile);
            setIsAdmin(userProfile?.is_admin === true);
          } else {
            setProfile(null);
            setIsAdmin(false);
          }
        } catch (err) {
          console.error("AuthState Error:", err);
        } finally {
          if (_event === "SIGNED_IN" || _event === "USER_UPDATED" || _event === "SIGNED_OUT") {
            setIsLoading(false, `Event ${_event} finally`);
          }
        }
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [fetchProfile]);

  const signOut = async () => {
    setIsLoading(true, "signOut");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("SignOut Error:", error.message);
        setIsLoading(false, "signOut error");
      }
    } catch (err) {
      console.error("SignOut Exception:", err);
      setIsLoading(false, "signOut exception");
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
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

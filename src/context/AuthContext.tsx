import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from '@/integrations/supabase/client'; // Corrected import path

// Define the Profile type based on your Supabase 'profiles' table structure
export type Profile = {
  id: string;
  full_name?: string | null;
  email?: string | null; // Added email as it's often useful
  avatar_url?: string | null;
  is_admin?: boolean | null;
  is_vendor?: boolean | null;
  created_at: string; // Added created_at
  // Add other relevant fields from your 'profiles' table
  business_name?: string | null;
  business_description?: string | null;
  phone?: string | null;
  address?: string | null;
  // ... any other fields you need globally
};

type AuthContextType = {
  session: any | null; // Use specific Supabase types if preferred (Session | null)
  user: any | null; // Use specific Supabase types if preferred (User | null)
  profile: Profile | null;
  isAdmin: boolean;
  isVendor: boolean; // Added isVendor for completeness
  isLoading: boolean; // Renamed from 'loading' for clarity
  signOut: () => Promise<void>; // Added signOut method
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  isAdmin: false,
  isVendor: false,
  isLoading: true,
  signOut: async () => {}, // Default empty function
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<any | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVendor, setIsVendor] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  console.log("[AuthProvider] Initializing...");

  useEffect(() => {
    console.log("[AuthProvider] useEffect triggered. Setting up auth listener.");
    setIsLoading(true); // Start loading

    const fetchSessionAndProfile = async (currentSession: any | null) => {
      console.log("[AuthProvider] fetchSessionAndProfile called. Session:", currentSession ? 'Exists' : 'Null');
      if (!currentSession?.user) {
        console.log("[AuthProvider] No user in session. Clearing state.");
        setProfile(null);
        setIsAdmin(false);
        setIsVendor(false);
        setIsLoading(false); // Stop loading
        return;
      }

      setUser(currentSession.user); // Set user early

      try {
        console.log("[AuthProvider] Fetching profile for user:", currentSession.user.id);
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*") // Select all profile fields
          .eq("id", currentSession.user.id)
          .single();

        if (profileError) {
          console.error("[AuthProvider] Error loading profile:", profileError);
          setProfile(null);
          setIsAdmin(false);
          setIsVendor(false);
        } else if (profileData) {
          console.log("[AuthProvider] Profile loaded:", profileData);
          setProfile(profileData as Profile);
          // Explicitly check for true, as null/undefined should be false
          const adminStatus = profileData.is_admin === true;
          const vendorStatus = profileData.is_vendor === true;
          setIsAdmin(adminStatus);
          setIsVendor(vendorStatus);
          console.log(`[AuthProvider] User roles set: isAdmin=${adminStatus}, isVendor=${vendorStatus}`);
        } else {
          console.warn("[AuthProvider] Profile not found for user:", currentSession.user.id);
          setProfile(null);
          setIsAdmin(false);
          setIsVendor(false);
        }
      } catch (e) {
        console.error("[AuthProvider] Exception during profile fetch:", e);
        setProfile(null);
        setIsAdmin(false);
        setIsVendor(false);
      } finally {
        console.log("[AuthProvider] fetchSessionAndProfile finished. Setting isLoading=false.");
        setIsLoading(false); // Stop loading after profile fetch attempt
      }
    };

    // Initial check for session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      console.log("[AuthProvider] Initial getSession completed. Session:", initialSession ? 'Exists' : 'Null');
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      fetchSessionAndProfile(initialSession); // Fetch profile based on initial session
    }).catch(error => {
        console.error("[AuthProvider] Error during initial getSession:", error);
        setIsLoading(false); // Ensure loading stops even if getSession fails
    });


    // Set up listener for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        console.log(`[AuthProvider] onAuthStateChange event: ${_event}. New session:`, newSession ? 'Exists' : 'Null');
        setSession(newSession);
        setUser(newSession?.user ?? null);
        // Re-fetch profile whenever the session changes (login, logout, token refresh)
        // Set loading true only if we expect a profile fetch
        if (newSession?.user) {
            setIsLoading(true); 
        }
        await fetchSessionAndProfile(newSession);
      }
    );

    // Cleanup listener on component unmount
    return () => {
      console.log("[AuthProvider] Cleaning up auth listener.");
      authListener?.subscription.unsubscribe();
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  const signOut = async () => {
    console.log("[AuthProvider] signOut called.");
    setIsLoading(true); // Indicate loading during sign out
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("[AuthProvider] Error signing out:", error);
      // Optionally show a toast error
    } else {
      console.log("[AuthProvider] Sign out successful. Clearing state.");
      // State will be cleared by the onAuthStateChange listener triggering with a null session
    }
    // isLoading will be set to false by the listener after state is cleared
  };

  const value = {
    session,
    user,
    profile,
    isAdmin,
    isVendor,
    isLoading,
    signOut,
  };

  console.log("[AuthProvider] Rendering provider with value:", { session: !!session, user: !!user, profile: !!profile, isAdmin, isVendor, isLoading });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  session: any;
  user: any;
  isAdmin: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isAdmin: false,
  isLoading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        setSession(session);
        const currentUser = session?.user;
        setUser(currentUser);

        if (currentUser) {
          const { data: adminData } = await supabase
            .from("admin_users")
            .select("role")
            .eq("id", currentUser.id)
            .single();

          if (adminData?.role === "admin") {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        }
      } catch (error) {
        console.error("Auth Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      bootstrapAuth();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, isAdmin, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

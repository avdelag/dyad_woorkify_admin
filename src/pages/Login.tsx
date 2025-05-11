"use client";
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import P5Sketch from '@/components/P5Sketch'; // Para mantener la estética

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, isAdmin, isLoading: authIsLoading } = useAuth(); // Usar isLoading de useAuth

  useEffect(() => {
    console.log("[Login Page] useEffect triggered. Session:", session, "isAdmin:", isAdmin, "authIsLoading:", authIsLoading);
    // No redirigir si todavía se está cargando la información de autenticación
    if (authIsLoading) {
      console.log("[Login Page] Auth data is loading, delaying redirect decision.");
      return;
    }

    if (session && isAdmin) {
      console.log("[Login Page] User is admin and session exists. Redirecting to /dashboard.");
      // Obtener la ruta de origen si existe, o ir al dashboard por defecto
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } else if (session && !isAdmin) {
      // Si el usuario está logueado pero no es admin, podría ser un error o un intento de acceso no autorizado
      console.warn("[Login Page] User has session but is not admin. Logging out and showing error.");
      supabase.auth.signOut(); // Desloguear para evitar bucles si llega aquí por error
      toast.error("Access denied. Only administrators can log in.");
      // Podrías redirigir a una página de "no autorizado" o simplemente quedarse en login
    }
    
    // Mostrar error si vino de ProtectedRoute
    if (location.state?.error) {
      toast.error(location.state.error);
      // Limpiar el error del estado para no mostrarlo de nuevo en recargas
      navigate(location.pathname, { state: { ...location.state, error: undefined }, replace: true });
    }

  }, [session, isAdmin, navigate, location, authIsLoading]);

  // Si authIsLoading es true y no hay sesión, podríamos mostrar un loader aquí
  // en lugar del formulario de Auth, pero por ahora dejaremos que Auth maneje su propio estado.

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4 relative overflow-hidden">
      <P5Sketch />
      <div className="relative z-10 w-full max-w-md bg-gray-800/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-gray-700">
        <div className="text-center mb-8">
          <span className="text-4xl font-bold text-brand-orange">Woorkify</span>
          <span className="text-4xl font-bold text-white"> Admin</span>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{ 
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'hsl(var(--primary))', // Usar la variable CSS para el color primario (coral)
                  brandAccent: 'hsl(var(--primary) / 0.9)', // Ligeramente más oscuro
                  defaultButtonBackgroundHover: 'hsl(var(--primary) / 0.8)',
                  inputBackground: 'hsl(var(--input))', 
                  inputBorder: 'hsl(var(--border))', 
                  inputText: 'hsl(var(--foreground))',
                  inputLabelText: 'hsl(var(--muted-foreground))',
                  messageText: 'hsl(var(--foreground))',
                  messageTextDanger: 'hsl(var(--destructive))', 
                },
                radii: {
                  borderRadiusButton: 'var(--radius)', 
                  buttonBorderRadius: 'var(--radius)',
                  inputBorderRadius: 'var(--radius)',
                }
              },
            },
          }}
          providers={[]}
          // redirectTo es una opción, pero el useEffect nos da más control
          // redirectTo={window.location.origin + '/dashboard'} 
          localization={{
            variables: {
              sign_in: {
                email_label: 'Email address',
                password_label: 'Password',
                button_label: 'Sign In',
              },
              sign_up: {
                email_label: 'Email address',
                password_label: 'Password',
                button_label: 'Sign Up',
                link_text: 'Don\'t have an account? Sign up',
              },
              forgotten_password: {
                link_text: 'Forgot your password?',
                email_label: 'Email address',
                button_label: 'Send reset instructions',
              }
            }
          }}
          theme="dark" // Usar el tema oscuro de Supabase Auth UI
          showLinks={true} // Mostrar link de "¿Olvidaste tu contraseña?" y "Crear cuenta"
        />
      </div>
    </div>
  );
}
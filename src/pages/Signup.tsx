"use client";
import { useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom'; // RouterLink para evitar conflicto de nombres
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import P5Sketch from '@/components/P5Sketch';
import { toast } from 'react-hot-toast';

// Importar PasswordInput no es necesario aquí si Auth UI lo maneja internamente
// o si personalizamos los campos de Auth UI, lo cual es más avanzado.
// Por ahora, confiaremos en que ThemeSupa podría tener esta funcionalidad o la añadiremos si es necesario.
// La funcionalidad de ver/ocultar contraseña es más fácil de implementar con inputs manuales.
// Supabase Auth UI no ofrece un prop directo para esto en sus campos por defecto.
// Para tenerlo, necesitaríamos usar "custom form components" con Auth UI, lo cual es más complejo.
// VAMOS A SIMPLIFICAR: Por ahora, no implementaremos el toggle de contraseña DENTRO de Supabase Auth UI
// ya que requiere una personalización profunda de sus componentes.
// Nos enfocaremos en que el signup funcione.

export default function Signup() {
  const navigate = useNavigate();
  const { session, isAdmin, isLoading: authIsLoading } = useAuth();

  useEffect(() => {
    if (authIsLoading) return;

    if (session && isAdmin) {
      navigate('/dashboard', { replace: true });
    } else if (session && !isAdmin) {
      // Si se registra y no es admin (debería serlo si es signup de admin)
      toast.error("Account created, but admin privileges not set. Contact support.");
      supabase.auth.signOut();
      navigate('/login');
    }
  }, [session, isAdmin, navigate, authIsLoading]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4 relative overflow-hidden">
      <P5Sketch />
      <div className="relative z-10 w-full max-w-md bg-gray-800/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-gray-700">
        <div className="text-center mb-8">
          <span className="text-4xl font-bold text-brand-orange">Woorkify</span>
          <span className="text-4xl font-bold text-white"> Admin Signup</span>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{ 
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'hsl(var(--primary))',
                  brandAccent: 'hsl(var(--primary) / 0.9)',
                  defaultButtonBackgroundHover: 'hsl(var(--primary) / 0.8)',
                  inputBackground: 'hsl(var(--input))',
                  inputBorder: 'hsl(var(--border))',
                  inputText: 'hsl(var(--foreground))',
                  inputLabelText: 'hsl(var(--muted-foreground))',
                },
                radii: {
                  borderRadiusButton: 'var(--radius)',
                  buttonBorderRadius: 'var(--radius)',
                  inputBorderRadius: 'var(--radius)',
                }
              },
            },
          }}
          view="sign_up" // Especificar que esta es la vista de registro
          providers={[]}
          // redirectTo={window.location.origin + '/login'} // Redirigir a login después de signup para confirmar
          theme="dark"
          localization={{
            variables: {
              sign_up: {
                email_label: 'Email address',
                password_label: 'Create a Password',
                button_label: 'Create Admin Account',
                // Si quieres añadir campos adicionales como "nombre completo",
                // necesitarías configurar "User Management -> Auth Settings -> User Metadata" en Supabase
                // y luego usar `supabase.auth.signUp({ email, password, options: { data: { full_name: '...' } } })`
                // lo cual implica no usar Auth UI directamente o personalizarlo mucho.
              },
            }
          }}
        />
        <p className="mt-8 text-sm text-center text-gray-400">
          Already have an admin account?{' '}
          <RouterLink to="/login" className="font-medium text-brand-blue hover:underline">
            Log In
          </RouterLink>
        </p>
      </div>
    </div>
  );
}
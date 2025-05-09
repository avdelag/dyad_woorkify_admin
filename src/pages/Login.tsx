"use client";
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, isAdmin } = useAuth();

  useEffect(() => {
    if (session && isAdmin) {
      navigate('/dashboard', { replace: true });
    }
    if (location.state?.error) {
      toast.error(location.state.error);
    }
  }, [session, isAdmin, navigate, location.state]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-xl shadow-2xl">
        <div className="text-center mb-8">
          <span className="text-4xl font-bold text-[#FF5E00]">Woorkify</span>
          <span className="text-4xl font-bold text-white"> Admin</span>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{ 
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#FF5E00',
                  brandAccent: '#E05100',
                  defaultButtonBackgroundHover: '#E05100',
                  inputBackground: '#374151', // bg-gray-700
                  inputBorder: '#4B5563', // border-gray-600
                  inputText: 'white',
                  inputLabelText: '#D1D5DB', // text-gray-300
                  messageText: 'white',
                  messageTextDanger: '#F87171', // text-red-400
                },
                radii: {
                  borderRadiusButton: '0.75rem', // rounded-xl
                  buttonBorderRadius: '0.75rem',
                  inputBorderRadius: '0.75rem',
                }
              },
            },
          }}
          providers={[]} // No social providers for admin panel for now
          redirectTo={window.location.origin + '/dashboard'} // Redirect after successful login/signup
          localization={{
            variables: {
              sign_in: {
                email_label: 'Email address',
                password_label: 'Password',
              },
              sign_up: {
                email_label: 'Email address',
                password_label: 'Password',
                button_label: 'Sign up',
                link_text: 'Don\'t have an account? Sign up',
              }
            }
          }}
          theme="dark" // Use Supabase Auth UI dark theme
        />
      </div>
    </div>
  );
}
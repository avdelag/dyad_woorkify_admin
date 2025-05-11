import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import P5Sketch from '@/components/P5Sketch';
import { PasswordInput } from '@/components/PasswordInput'; // Usar el componente de contraseña

export default function AdminSecret() {
  const [code, setCode] = useState('');
  const [isCodeVerified, setIsCodeVerified] = useState(false); // Nuevo estado
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ESTE CÓDIGO ES SOLO PARA EJEMPLO LOCAL.
    // EN PRODUCCIÓN, ESTA VERIFICACIÓN DEBERÍA SER EN BACKEND Y MÁS SEGURA.
    if (code === 'ADMIN2025') { 
      toast.success('Admin code verified!');
      setIsCodeVerified(true); // Mostrar botones de login/signup
    } else {
      toast.error('Invalid admin code!');
      setIsCodeVerified(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4 relative overflow-hidden">
      <P5Sketch />
      <div className="relative z-10 w-full max-w-md bg-gray-800/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-gray-700">
        <div className="text-center mb-8">
          <span className="text-4xl font-bold text-brand-orange">Woorkify</span>
          <span className="text-4xl font-bold text-white"> Admin</span>
          <p className="text-gray-400 mt-2">Admin Portal Access</p>
        </div>

        {!isCodeVerified ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="adminCode" className="text-gray-300">Enter Admin Secret Code</Label>
              {/* Usamos PasswordInput para el campo de código secreto */}
              <PasswordInput
                id="adminCode"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Your secret code"
                required
                className="mt-1 bg-gray-700 text-white border-gray-600 focus:border-brand-orange focus:ring-brand-orange"
              />
            </div>
            <Button type="submit" className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white text-lg py-3">
              Verify Code
            </Button>
            <p className="mt-6 text-xs text-center text-gray-500">
              This is a security step to access the admin login/signup area.
            </p>
          </form>
        ) : (
          <div className="space-y-6 text-center">
            <p className="text-green-400 font-semibold">Code Verified Successfully!</p>
            <p className="text-gray-300">Please proceed to log in or create a new admin account.</p>
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 sm:justify-center pt-4">
              <Button 
                onClick={() => navigate('/login')} 
                variant="outline"
                className="w-full sm:w-auto border-brand-blue text-brand-blue hover:bg-brand-blue/10 hover:text-brand-blue text-lg py-3"
              >
                Go to Login
              </Button>
              <Button 
                onClick={() => navigate('/signup')} 
                variant="outline"
                className="w-full sm:w-auto border-brand-green text-brand-green hover:bg-brand-green/10 hover:text-brand-green text-lg py-3"
              >
                Create Admin Account
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
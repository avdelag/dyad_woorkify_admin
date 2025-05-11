import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom' // Añadido Link
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import P5Sketch from '@/components/P5Sketch' // Mantener estética

export default function AdminSecret() {
  const [code, setCode] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // ESTE CÓDIGO ES SOLO PARA EJEMPLO LOCAL. EN PRODUCCIÓN, ESTA VERIFICACIÓN DEBERÍA SER EN BACKEND.
    if (code === 'ADMIN2025') { 
      toast.success('Code accepted! Proceed to login or sign up.');
      // No redirigimos automáticamente, dejamos que el usuario elija.
      // O podrías redirigir a una página intermedia que ofrezca ambas opciones.
      // Por simplicidad, asumiremos que el usuario ve los botones de abajo.
    } else {
      toast.error('Invalid admin code!')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4 relative overflow-hidden">
      <P5Sketch />
      <div className="relative z-10 w-full max-w-md bg-gray-800/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-gray-700">
        <div className="text-center mb-8">
          <span className="text-4xl font-bold text-brand-orange">Woorkify</span>
          <span className="text-4xl font-bold text-white"> Admin</span>
          <p className="text-gray-400 mt-2">Admin Verification</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="adminCode" className="text-gray-300">Admin Secret Code</Label>
            <Input
              id="adminCode"
              type="password" // Debería ser password para ocultar el código
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter secret code"
              required
              className="mt-1 bg-gray-700 text-white border-gray-600 focus:border-brand-orange focus:ring-brand-orange"
            />
          </div>
          <Button type="submit" className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white text-lg py-3">
            Verify Code
          </Button>
        </form>
        {/* Opciones después de verificar el código (o siempre visibles si prefieres) */}
        {/* Idealmente, estos botones aparecerían o se activarían DESPUÉS de verificar el código. */}
        {/* Por ahora, los mostramos y el usuario debe verificar primero. */}
        <div className="mt-8 flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 sm:justify-center">
            <Button 
              onClick={() => navigate('/login')} 
              variant="outline"
              className="w-full sm:w-auto border-brand-blue text-brand-blue hover:bg-brand-blue/10 hover:text-brand-blue"
            >
              Go to Login
            </Button>
            <Button 
              onClick={() => navigate('/signup')} 
              variant="outline"
              className="w-full sm:w-auto border-brand-green text-brand-green hover:bg-brand-green/10 hover:text-brand-green"
            >
              Create Admin Account
            </Button>
        </div>
         <p className="mt-6 text-xs text-center text-gray-500">
          Note: The "Admin Secret Code" is a placeholder for a more secure verification method.
        </p>
      </div>
    </div>
  )
}
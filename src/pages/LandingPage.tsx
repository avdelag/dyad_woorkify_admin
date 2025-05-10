import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button' 
import P5Sketch from '@/components/P5Sketch'; // Importar P5Sketch

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4 text-center relative overflow-hidden">
      <P5Sketch /> {/* Añadir el componente P5Sketch para el fondo animado */}
      
      {/* Contenido principal con z-index para estar sobre la animación */}
      <div className="relative z-10">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 drop-shadow-md">
          <span className="text-brand-orange">Woorkify</span>
          <span className="text-white"> Admin Portal</span>
        </h1>
        <p className="text-xl text-purple-200 mb-12 max-w-lg mx-auto">
          Manage users, vendors, and services with ease. Secure and efficient administration for the Woorkify platform.
        </p>
        <Button
          onClick={() => navigate('/admin-secret')}
          variant="default" // Usará el color primario (coral) y los estilos de hover definidos en buttonVariants
          size="lg" // Para un botón grande y prominente
          className="px-10 py-3 text-lg font-semibold shadow-lg" // Ajustado padding y tamaño de texto. hover:scale-105 y transiciones vienen de la variante.
        >
          Admin Code Access
        </Button>
      </div>
    </div>
  )
}
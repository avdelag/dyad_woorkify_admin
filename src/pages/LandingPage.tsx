import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import P5Sketch from '@/components/P5Sketch'; // Fondo animado
import { ShieldCheck, BarChartBig, MessageSquareText, Users } from 'lucide-react'; // Iconos relevantes

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Users className="h-10 w-10 text-brand-blue" />,
      title: "User Management",
      description: "Oversee clients and vendors with powerful tools.",
    },
    {
      icon: <BarChartBig className="h-10 w-10 text-brand-purple" />,
      title: "Platform Analytics",
      description: "Gain insights with comprehensive statistics and reports.",
    },
    {
      icon: <MessageSquareText className="h-10 w-10 text-brand-green" />,
      title: "Communication Hub",
      description: "Manage interactions and support tickets efficiently.",
    },
    {
      icon: <ShieldCheck className="h-10 w-10 text-brand-orange" />,
      title: "Secure Administration",
      description: "Robust control panel for your Woorkify ecosystem.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4 text-center relative overflow-hidden">
      <P5Sketch /> {/* Fondo animado P5.js */}
      
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo o Nombre de la App */}
        <div className="mb-10">
          <span className="text-6xl md:text-7xl font-extrabold text-brand-orange tracking-tight">
            Woorkify
          </span>
          <span className="block text-4xl md:text-5xl font-semibold text-white mt-1">
            Admin Portal
          </span>
        </div>

        <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
          Welcome to the central hub for managing the Woorkify platform. Access powerful tools, monitor activity, and ensure smooth operations.
        </p>

        <Button
          onClick={() => navigate('/admin-secret')} // O '/login' si el admin-secret no es necesario
          variant="default" // Usará el color primario (coral)
          size="lg"
          className="px-12 py-4 text-xl font-semibold shadow-xl hover:shadow-2xl focus:ring-4 focus:ring-primary/50"
        >
          Access Admin Panel
        </Button>

        {/* Sección de Características Opcional */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl w-full px-4">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-card/60 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-border/30 flex flex-col items-center text-center transform hover:scale-105 transition-transform duration-300"
            >
              <div className="p-3 bg-gray-800 rounded-full mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
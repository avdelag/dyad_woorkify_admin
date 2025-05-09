import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button' // Assuming you have a Button component

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-brand-blue p-4 text-center">
      <h1 className="text-5xl font-bold text-white mb-6">
        Woorkify Admin Portal
      </h1>
      <p className="text-xl text-purple-200 mb-12 max-w-lg">
        Manage users, vendors, and services with ease. Secure and efficient administration for the Woorkify platform.
      </p>
      <Button
        onClick={() => navigate('/admin-secret')}
        className="px-10 py-4 bg-brand-orange hover:bg-orange-600 text-white text-xl font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-150"
      >
        Admin Code Access
      </Button>
    </div>
  )
}
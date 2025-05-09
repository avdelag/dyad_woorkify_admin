import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email && password) {
      // Mock login success
      toast.success('Login successful!')
      // In a real app, you'd set some auth state here
      navigate('/dashboard')
    } else {
      toast.error('Please fill all fields')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-brand-orange to-orange-400 p-4">
      <div className="w-full max-w-md bg-card p-8 rounded-xl shadow-2xl">
        <h1 className="text-3xl font-bold text-center text-foreground mb-2">Welcome Back!</h1>
        <p className="text-center text-muted-foreground mb-8">Login to access your admin dashboard.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="mt-1"
            />
          </div>
          <Button type="submit" className="w-full bg-brand-orange hover:bg-orange-600 text-white text-lg py-3">
            Log In
          </Button>
        </form>
        <p className="mt-8 text-sm text-center text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-brand-orange hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
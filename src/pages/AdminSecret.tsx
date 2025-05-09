import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AdminSecret() {
  const [code, setCode] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (code === 'ADMIN2025') {
      toast.success('Code accepted! Redirecting to login...')
      navigate('/login')
    } else {
      toast.error('Invalid admin code!')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-xl shadow-2xl">
        <h1 className="text-3xl font-bold text-center text-white mb-2">Admin Verification</h1>
        <p className="text-center text-gray-400 mb-8">Enter the secret code to proceed.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="adminCode" className="text-gray-300">Admin Code</Label>
            <Input
              id="adminCode"
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter secret code"
              required
              className="mt-1 bg-gray-700 text-white border-gray-600 focus:border-brand-orange focus:ring-brand-orange"
            />
          </div>
          <Button type="submit" className="w-full bg-brand-orange hover:bg-orange-600 text-white text-lg py-3">
            Verify Code
          </Button>
        </form>
      </div>
    </div>
  )
}
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Signup from './pages/auth/Signup'
import AdminSecret from './pages/auth/AdminSecret'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth/login" element={<Login />} />
      <Route path="/auth/signup" element={<Signup />} />
      <Route path="/auth/admin-secret" element={<AdminSecret />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  )
}

export default App
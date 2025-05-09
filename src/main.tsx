import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import AdminSecret from './pages/AdminSecret'
import Dashboard from './pages/Dashboard'
import './globals.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm p-4">
        <div className="flex gap-4">
          <Link to="/" className="text-blue-600 hover:text-blue-800">Home</Link>
          <Link to="/login" className="text-blue-600 hover:text-blue-800">Login</Link>
          <Link to="/signup" className="text-blue-600 hover:text-blue-800">Signup</Link>
          <Link to="/admin-secret" className="text-blue-600 hover:text-blue-800">Admin</Link>
          <Link to="/dashboard" className="text-blue-600 hover:text-blue-800">Dashboard</Link>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin-secret" element={<AdminSecret />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
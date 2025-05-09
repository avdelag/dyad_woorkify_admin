import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/context/AuthProvider';
import ProtectedRoute from '@/components/ProtectedRoute';

// Lazy load pages
const Home = React.lazy(() => import('@/pages/Home'));
const Login = React.lazy(() => import('@/pages/Login'));
const Signup = React.lazy(() => import('@/pages/Signup'));
const Admin = React.lazy(() => import('@/pages/Admin'));
const Dashboard = React.lazy(() => import('@/pages/dashboard/Dashboard'));
const Vendors = React.lazy(() => import('@/pages/dashboard/Vendors'));
const Clients = React.lazy(() => import('@/pages/dashboard/Clients'));
const Orders = React.lazy(() => import('@/pages/dashboard/Orders'));
const Messages = React.lazy(() => import('@/pages/dashboard/Messages'));

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster position="top-right" />
        <AuthProvider>
          <BrowserRouter>
            <React.Suspense fallback={<div>Loading...</div>}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auth/admin" element={<Admin />} />
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/signup" element={<Signup />} />
                
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }>
                  <Route path="vendors" element={<Vendors />} />
                  <Route path="clients" element={<Clients />} />
                  <Route path="orders" element={<Orders />} />
                  <Messages path="messages" element={<Messages />} />
                </Route>
              </Routes>
            </React.Suspense>
          <BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
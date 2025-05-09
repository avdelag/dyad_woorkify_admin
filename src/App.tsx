import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthProvider';
import ProtectedRoute from '@/components/ProtectedRoute';

// Lazy load components
const Home = lazy(() => import('@/pages/Home'));
const Login = lazy(() => import('@/pages/Login'));
const Signup = lazy(() => import('@/pages/Signup'));
const AdminSecret = lazy(() => import('@/pages/AdminSecret'));
const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'));
const Vendors = lazy(() => import('@/pages/dashboard/Vendors'));
const Clients = lazy(() => import('@/pages/dashboard/Clients'));
const Orders = lazy(() => import('@/pages/dashboard/Orders'));
const Messages = lazy(() => import('@/pages/dashboard/Messages'));

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<div>Loading...</div>}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auth/admin-secret" element={<AdminSecret />} />
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
                  <Route path="messages" element={<Messages />} />
                </Route>
              </Routes>
            </Suspend>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
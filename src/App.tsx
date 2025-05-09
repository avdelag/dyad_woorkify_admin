import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Routes, Route } from "react-router-dom"
import { Suspense, lazy } from "react"
import { Loading } from "@/components/Loading"
import { AuthProvider } from "@/context/AuthContext"
import { ProtectedRoute } from "@/components/ProtectedRoute"

const queryClient = new QueryClient()

// Lazy load pages with correct file paths
const Home = lazy(() => import("@/pages/Index"))
const NotFound = lazy(() => import("@/pages/NotFound"))
const AdminSecret = lazy(() => import("@/pages/auth/AdminSecret"))
const Login = lazy(() => import("@/pages/auth/Login"))
const Signup = lazy(() => import("@/pages/auth/Signup"))
const Dashboard = lazy(() => import("@/pages/dashboard/Dashboard"))
const Vendors = lazy(() => import("@/pages/dashboard/Vendors"))
const Clients = lazy(() => import("@/pages/dashboard/Clients"))
const Orders = lazy(() => import("@/pages/dashboard/Orders"))
const Messages = lazy(() => import("@/pages/dashboard/Messages"))

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AuthProvider>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth/admin-secret" element={<AdminSecret />} />
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/signup" element={<Signup />} />
              
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard/vendors" element={
                <ProtectedRoute>
                  <Vendors />
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard/clients" element={
                <ProtectedRoute>
                  <Clients />
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard/orders" element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard/messages" element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App
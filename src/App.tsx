import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AdminSecret from './pages/AdminSecret';
import Login from './pages/Login';
import { DashboardLayout } from './components/layout/DashboardLayout'; 
import DashboardOverview from './pages/dashboard/Overview';
import DashboardClients from './pages/dashboard/Clients';
import DashboardVendors from './pages/dashboard/Vendors';
import DashboardStatistics from './pages/dashboard/Statistics';
import DashboardSettings from './pages/dashboard/Settings';
import DashboardMessages from './pages/dashboard/Messages';
import DashboardProfile from './pages/dashboard/Profile';
import DashboardOrders from './pages/dashboard/Orders';
import NotFoundPage from './pages/NotFound';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin-secret" element={<AdminSecret />} />
        <Route path="/login" element={<Login />} />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardOverview />} />
          <Route path="clients" element={<DashboardClients />} />
          <Route path="vendors" element={<DashboardVendors />} />
          <Route path="orders" element={<DashboardOrders />} />
          <Route path="statistics" element={<DashboardStatistics />} />
          <Route path="messages" element={<DashboardMessages />} />
          <Route path="profile" element={<DashboardProfile />} />
          <Route path="settings" element={<DashboardSettings />} />
          {/* Considera añadir una ruta catch-all dentro del dashboard si es necesario */}
          {/* <Route path="*" element={<NotFoundPage />} /> */} 
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
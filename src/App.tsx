import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AdminSecret from './pages/AdminSecret'; // Asumo que aún lo usas
import Login from './pages/Login';
// import Signup from './pages/Signup'; // Supabase Auth UI maneja esto
import { DashboardLayout } from './components/layout/DashboardLayout'; 
import DashboardOverview from './pages/dashboard/Overview';
import DashboardUsers from './pages/dashboard/Clients'; // Renombrado a Clients
import DashboardVendors from './pages/dashboard/Vendors';
import DashboardStatistics from './pages/dashboard/Statistics';
import DashboardSettings from './pages/dashboard/Settings';
import DashboardMessages from './pages/dashboard/Messages';
import DashboardProfile from './pages/dashboard/Profile';
import DashboardOrders from './pages/dashboard/Orders'; // Nueva importación
import NotFoundPage from './pages/NotFound';

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin-secret" element={<AdminSecret />} />
        <Route path="/login" element={<Login />} />
        {/* <Route path="/signup" element={<Signup />} /> */}
        
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="clients" element={<DashboardUsers />} /> {/* Ruta renombrada */}
          <Route path="vendors" element={<DashboardVendors />} />
          <Route path="orders" element={<DashboardOrders />} /> {/* Nueva ruta */}
          <Route path="statistics" element={<DashboardStatistics />} />
          <Route path="messages" element={<DashboardMessages />} />
          <Route path="profile" element={<DashboardProfile />} />
          <Route path="settings" element={<DashboardSettings />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
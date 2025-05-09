import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AdminSecret from './pages/AdminSecret';
import Login from './pages/Login';
import Signup from './pages/Signup';
// Import DashboardLayout
import { DashboardLayout } from './components/layout/DashboardLayout'; 
// Import new dashboard pages
import DashboardOverview from './pages/dashboard/Overview';
import DashboardUsers from './pages/dashboard/Users';
import DashboardVendors from './pages/dashboard/Vendors';
import DashboardStatistics from './pages/dashboard/Statistics';
import DashboardSettings from './pages/dashboard/Settings';

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin-secret" element={<AdminSecret />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardOverview />} /> {/* Default for /dashboard */}
          <Route path="users" element={<DashboardUsers />} />
          <Route path="vendors" element={<DashboardVendors />} />
          <Route path="statistics" element={<DashboardStatistics />} />
          <Route path="settings" element={<DashboardSettings />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
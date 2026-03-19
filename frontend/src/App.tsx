import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/admin/Dashboard';
import Appointments from './pages/admin/Appointments';
import Customers from './pages/admin/Customers';
import Services from './pages/admin/Services';
import BookingPage from './pages/client/BookingPage';
import AdminLayout from './components/layout/AdminLayout';
import ClientLayout from './components/layout/ClientLayout';
import ClientAppointments from './pages/client/ClientAppointments';
import ProtectedRoute from './components/ProtectedRoute';
import { getStoredUserRole, subscribeToAuthChanges } from './utils/auth';

function App() {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const syncUserRole = () => {
      setUserRole(getStoredUserRole() ?? 'guest');
    };

    syncUserRole();
    return subscribeToAuthChanges(syncUserRole);
  }, []);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes key={userRole || 'loading'}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/services" element={<Services />} />
        </Route>

        <Route element={<ProtectedRoute requiredRole="user"><ClientLayout /></ProtectedRoute>}>
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/my-appointments" element={<ClientAppointments />} />
        </Route>

        <Route path="*" element={<h1>404 - Pagina non trovata</h1>} />
      </Routes>
    </Router>
  );
}

export default App;

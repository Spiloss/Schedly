import { Outlet, Navigate } from 'react-router-dom';
import { AdminSidebar } from '../AdminSidebar'; 
import { getStoredUser, getStoredUserRole } from '../../utils/auth';

const AdminLayout = () => {
  const user = getStoredUser();
  const userRole = getStoredUserRole();

  if (!user?.id || !userRole) {
    return <Navigate to="/login" replace />;
  }

  if (userRole !== 'admin') {
    return <Navigate to="/booking" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

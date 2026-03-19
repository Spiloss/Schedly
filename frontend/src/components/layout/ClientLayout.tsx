import { Outlet, Navigate } from 'react-router-dom';
import { ClientSidebar } from '../ClientSidebar';
import { getStoredUser, getStoredUserRole } from '../../utils/auth';

const ClientLayout: React.FC = () => {
  const user = getStoredUser();
  const userRole = getStoredUserRole();

  if (!user?.id || !userRole) {
    return <Navigate to="/login" replace />;
  }

  if (userRole !== 'user') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <ClientSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default ClientLayout;

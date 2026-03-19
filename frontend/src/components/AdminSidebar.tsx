import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, Package, LogOut } from 'lucide-react';
import { clearStoredAuth } from '../utils/auth';

export const AdminSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearStoredAuth();
    navigate('/login', { replace: true });
  };

  const menu = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Calendar, label: 'Appuntamenti', path: '/appointments' },
    { icon: Users, label: 'Clienti', path: '/customers' },
    { icon: Package, label: 'Servizi', path: '/services' },
  ];

  return (
    <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col h-screen flex-shrink-0">
      <div className="p-8 text-2xl font-black text-white tracking-tighter">SCHEDLY.</div>
      
      <nav className="flex-1 px-4 space-y-2">
        {menu.map((item, i) => (
          <NavLink
            key={i} 
            to={item.path}
            className={({ isActive }) =>
              `w-full flex items-center space-x-3 p-3 rounded-xl transition font-medium ${
                isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'
              }`
            }
          >
            <item.icon size={20} /> 
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={handleLogout} 
          className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-red-500/10 text-red-400 transition font-medium"
        >
          <LogOut size={20} /> 
          <span>Esci</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;

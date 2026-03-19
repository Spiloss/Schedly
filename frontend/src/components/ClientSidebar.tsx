import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, CalendarPlus, ListChecks } from 'lucide-react';
import { clearStoredAuth } from '../utils/auth';

export const ClientSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearStoredAuth();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { label: 'Prenota', path: '/booking', icon: CalendarPlus },
    { label: 'Appuntamenti', path: '/my-appointments', icon: ListChecks },
  ];

  return (
    <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col h-screen flex-shrink-0">
      <div className="p-8 text-2xl font-black text-white tracking-tighter">SCHEDLY.</div>
      
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
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

export default ClientSidebar;

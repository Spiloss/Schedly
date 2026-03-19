import { useEffect, useState } from 'react';
import { Calendar, Users, Star, ArrowRight, Plus, UserPlus, ListTodo } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiUrl } from '../../utils/api';

const Dashboard = () => {
  const [stats, setStats] = useState({ appointments: 0, customers: 0, services: 0 });
  const [upcoming, setUpcoming] = useState<any[]>([]); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, servRes, bookRes] = await Promise.all([
          fetch(apiUrl('/stats/overview')),
          fetch(apiUrl('/services')),
          fetch(apiUrl('/bookings')) 
        ]);

        if (!statsRes.ok || !servRes.ok || !bookRes.ok) {
          throw new Error('Errore nel caricamento dei dati dashboard');
        }

        const overview = await statsRes.json();
        const servs = await servRes.json();
        const bookings = await bookRes.json();
        
        setStats({ 
          appointments: overview.appointments || 0, 
          customers: overview.customers || 0, 
          services: servs.length || 0 
        });

        const now = new Date();
        const sorted = bookings
          .filter((b: any) => new Date(b.booking_datetime) > now)
          .sort((a: any, b: any) => new Date(a.booking_datetime).getTime() - new Date(b.booking_datetime).getTime())
          .slice(0, 4);
        
        setUpcoming(sorted);
      } catch {
        setStats({ appointments: 0, customers: 0, services: 0 });
        setUpcoming([]);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
     
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-black text-slate-800 mb-8">Bentornato, Admin 👋</h1>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
     
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4"><Calendar /></div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Appuntamenti Oggi</p>
            <h3 className="text-3xl font-black mt-1">{stats.appointments}</h3>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-4"><Users /></div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Totale Clienti</p>
            <h3 className="text-3xl font-black mt-1">{stats.customers}</h3>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4"><Star /></div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Servizi Attivi</p>
            <h3 className="text-3xl font-black mt-1">{stats.services}</h3>
          </div>
        </div>

 
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-900 rounded-3xl p-8 text-white">
            <h3 className="text-xl font-bold mb-6">Azioni Rapide</h3>
            <div className="space-y-4">
              <Link to="/appointments" className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition">
                <div className="flex items-center gap-3"><ListTodo className="text-blue-400" /> <span className="font-bold">Calendario Appuntamenti</span></div>
                <ArrowRight size={18} />
              </Link>
              <Link to="/customers" className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition">
                <div className="flex items-center gap-3"><UserPlus className="text-green-400" /> <span className="font-bold">Aggiungi Cliente</span></div>
                <ArrowRight size={18} />
              </Link>
              <Link to="/services" className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition">
                <div className="flex items-center gap-3"><Plus className="text-purple-400" /> <span className="font-bold">Gestisci Catalogo Servizi</span></div>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold mb-6 text-slate-800">Prossimi Appuntamenti</h3>
            {upcoming.length > 0 ? (
              <div className="space-y-4">
                {upcoming.map((appt) => (
                  <div key={appt.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                    <div>
                      <p className="font-bold text-slate-800">{appt.customers?.first_name || 'Cliente'} {appt.customers?.last_name || ''}</p>
                      <p className="text-xs text-slate-500 font-medium">
                        {new Date(appt.booking_datetime).toLocaleDateString()} - {new Date(appt.booking_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                      {appt.services?.name || 'Servizio'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-6 border-2 border-dashed border-slate-100 rounded-2xl">
                <p className="text-slate-400 font-medium">Nessun appuntamento in vista.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

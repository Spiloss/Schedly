import { useState, useEffect } from 'react';
import { CalendarDays, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { getStoredUser } from '../../utils/auth';
import { apiUrl } from '../../utils/api';
import moment from 'moment'; 


const ClientAppointments = () => {
  const [appointments, setAppointments] = useState<any[]>([]);

  const fetchAppointments = () => {
    const user = getStoredUser(); 
    if (!user?.id) return;

    // 1. Passiamo correttamente i filtri che il backend si aspetta
    const queryParams = new URLSearchParams({
      userId: user.id,
      role: user.role || 'customer'
    });

    fetch(`${apiUrl('/bookings')}?${queryParams.toString()}`)
      .then(res => res.json())
      .then(data => {      
        setAppointments(Array.isArray(data) ? data : []);
      })
      .catch(() => setAppointments([]));
  };

  useEffect(() => {
    fetchAppointments();
    const interval = setInterval(fetchAppointments, 10000); 
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle2 className="text-emerald-500" size={22} />;
      case 'cancelled': return <XCircle className="text-red-500" size={22} />;
      case 'pending': return <Clock className="text-amber-500" size={22} />;
      default: return <AlertCircle className="text-slate-400" size={22} />;
    }
  };

  return (
    <div className="w-full">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-800 italic">I Miei Appuntamenti</h1>
        <p className="text-slate-500 font-medium">Controlla lo stato delle tue prenotazioni in tempo reale.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {appointments.length > 0 ? (
          appointments.map((app) => (
            <div key={app.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-indigo-50 p-3 rounded-2xl">
                  <CalendarDays size={24} className="text-indigo-600" />
                </div>
                <div className="flex flex-col items-end">
                  {getStatusIcon(app.status)}
                  <span className="text-[10px] font-black uppercase mt-1 text-slate-400 tracking-tighter">
                    {app.status}
                  </span>
                </div>
              </div>

              <div className="mb-3">
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Servizio</span>
                <h3 className="font-black text-xl text-slate-800 leading-tight">
                  {app.services?.name || 'Servizio Generico'}
                </h3>
              </div>
              
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-slate-600 font-bold">
                  <Clock size={16} className="text-slate-400" />
                  <span>{moment(app.booking_datetime).format('DD MMMM YYYY')}</span>
                </div>
                <div className="text-2xl font-black text-indigo-600">
                  {moment(app.booking_datetime).format('HH:mm')}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase">
                <span>Durata: {app.services?.duration || 30} min</span>
                <span>ID: #{app.id.slice(0, 5)}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full p-20 text-center border-2 border-dashed border-slate-200 rounded-[40px] bg-slate-50/50">
            <div className="text-slate-300 mb-4 flex justify-center"><CalendarDays size={48} /></div>
            <p className="text-slate-400 font-bold text-lg">Non hai ancora prenotato nulla.</p>
            <p className="text-slate-400 text-sm">Inizia subito prenotando il tuo primo servizio!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientAppointments;

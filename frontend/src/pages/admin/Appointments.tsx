import { useEffect, useState, useMemo } from 'react';
import { Plus, X, Check } from 'lucide-react';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import itLocale from '@fullcalendar/core/locales/it';
import { apiUrl } from '../../utils/api';

const Appointments = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorConflict, setErrorConflict] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, id: string | null}>({isOpen: false, id: null});

  const isAdmin = true; 

  const [formData, setFormData] = useState({ 
    customer_id: '', 
    service_id: '', 
    booking_datetime: '' 
  });

  const fetchData = async () => {
  try {
    const storedUser = sessionStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;

    const bookingsParams = new URLSearchParams({
      userId: user?.id || '',
      role: user?.role || ''
    }).toString();

    const [resA, resS, resC] = await Promise.all([
      fetch(apiUrl(`/bookings?${bookingsParams}`)), 
      fetch(apiUrl('/services')),
      fetch(apiUrl('/customers'))
    ]);

    const apps = await resA.json();
    const servs = await resS.json();
    const custs = await resC.json();

    setAppointments(apps);
    setServices(servs);
    setCustomers(custs);
  } catch (err) {
    console.error("Errore fetch data:", err);
    setAppointments([]);
    setServices([]);
    setCustomers([]);
  }
};

  useEffect(() => { fetchData(); }, []);

  const calendarEvents = useMemo(() => {
    return appointments
      .filter(apt => apt.status === 'confirmed')
      .map(apt => {
        const customer = customers.find(c => c.id === apt.customer_id);
        const service = services.find(s => s.id === apt.service_id);

        const fullName = `${customer?.first_name || ''} ${customer?.last_name || ''}`.trim();

        return {
          id: apt.id,
          title: fullName || "Cliente",
          start: apt.booking_datetime,
          end: moment(apt.booking_datetime)
            .add(service?.duration || 30, "minutes")
            .toISOString(),
          extendedProps: {
            serviceName: service?.name || "Servizio",
            status: apt.status
          }
        };
      });
  }, [appointments, customers, services]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(apiUrl(`/bookings/${id}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchData();
      } else {
        alert("Errore aggiornamento appuntamento");
      }
    } catch {
      alert("Errore aggiornamento appuntamento");
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorConflict(null);
    const status = isAdmin ? 'confirmed' : 'pending';

    const isOverlap = appointments.some(apt => {
      const start = new Date(apt.booking_datetime).getTime();
      const duration = services.find(s => s.id === apt.service_id)?.duration || 30;
      const end = start + duration * 60000;
    
      const newStart = new Date(formData.booking_datetime).getTime();
      return newStart >= start && newStart < end;
    });

    if (isOverlap) {
      setErrorConflict("L'orario selezionato è già occupato da un altro appuntamento.");
      return;
    }

    const normalizedDate = moment(formData.booking_datetime).toISOString();
    const bodyData = {
      ...formData,
      booking_datetime: normalizedDate,
      status
    };

    const res = await fetch(apiUrl('/bookings'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData),
    });

    if (res.ok) {
      fetchData();
      setIsAddModalOpen(false);
      setSearchTerm('');
      setFormData({ customer_id: '', service_id: '', booking_datetime: '' });
    } else {
      const data = await res.json();
      alert("Errore: " + (data.error || "Permessi insufficienti"));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(apiUrl(`/bookings/${id}`), {
        method: 'DELETE'
      });

      if (!res.ok) {
        alert("Errore eliminazione");
        return;
      }

      setAppointments(prev => prev.filter(a => a.id !== id));
    } catch {
      alert("Errore eliminazione");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
    
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-black text-slate-800">Appuntamenti</h1>
          <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition">
            <Plus size={18} /> Nuova Prenotazione
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Cliente</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Servizio</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Data e Ora</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {appointments
                .filter((apt) => apt.status === 'pending') 
                .map((apt) => (
                  <tr key={apt.id} className="border-b border-slate-50 hover:bg-slate-50">
                 <td className="p-4 font-bold text-slate-800">
                    {apt.customers 
                      ? `${apt.customers.first_name || ''} ${apt.customers.last_name || ''}` 
                      : "Cliente non associato"}
                    <div className="text-[10px] text-slate-400 font-normal">
                      {apt.customers?.phone || ""}
                    </div>
                  </td>
                    <td className="p-4">
                      <div className="font-semibold">{apt.services?.name || 'Servizio rimosso'}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-bold">{moment(apt.booking_datetime).format('DD/MM/YYYY')}</div>
                      <div className="text-xs font-bold">{moment(apt.booking_datetime).format('HH:mm')}</div>
                    </td>
                    <td className="p-4">
                      <span className="bg-amber-100 text-amber-700 px-2 py-1 text-[10px] font-bold rounded-lg uppercase">
                        {apt.status}
                      </span>
                    </td>
                    <td className="p-4 text-right flex gap-2 justify-end">
                      <button onClick={() => updateStatus(apt.id, 'confirmed')} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"><Check size={16} /></button>
                      <button onClick={() => updateStatus(apt.id, 'cancelled')} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><X size={16} /></button>
                    </td>
                  </tr>
                ))}
            </tbody>
            
          </table>
        </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          locale={itLocale}

          initialView="timeGridWeek"

          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}

          events={calendarEvents}

          height="75vh"
          expandRows={true}
          stickyHeaderDates={true}
          nowIndicator={true}

          slotMinTime="00:00:00"
          slotMaxTime="23:59:59"

          slotDuration="00:15:00"
          slotLabelInterval="01:00"

          allDaySlot={false}

          dayMaxEvents={true}
          eventOverlap={false}

          selectable={true}
          editable={true}
          eventDrop={async (info) => {
            const { id, start } = info.event;
            const normalizedDate = moment(start).toISOString();

            try {
              const response = await fetch(apiUrl(`/bookings/${id}`), {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ booking_datetime: normalizedDate }),
              });

              if (!response.ok) {
                info.revert();
                return;
              }

              fetchData();
            } catch {
              info.revert();
            }
          }}
          eventContent={(eventInfo) => {
            const time = eventInfo.timeText;
            const name = eventInfo.event.title;
            const service = eventInfo.event.extendedProps.serviceName;

            return (
              <div className="flex flex-col h-full w-full px-2 py-1 overflow-hidden">
                <div className="text-[10px] font-bold text-indigo-600 leading-none">
                  {time}
                </div>

                <div className="text-xs font-black text-slate-800 truncate leading-tight">
                  {name}
                </div>
                
                <div className="text-[10px] text-slate-500 italic truncate leading-tight">
                  {service}
                </div>
              </div>
            );
          }}
          eventDidMount={(info) => {
            info.el.style.background = "#ffffff";
            info.el.style.borderLeft = "4px solid #6366f1";
            info.el.style.borderRadius = "8px";
            info.el.style.boxShadow = "0 1px 4px rgba(0,0,0,0.08)";
            info.el.style.padding = "2px";
          }}
          eventClick={(info) => {
            setDeleteModal({ isOpen: true, id: info.event.id });
          }}
        />
      </div>
      </main>
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 w-80 shadow-2xl">
            <h3 className="font-black text-lg mb-2">Conferma cancellazione</h3>
            <p className="text-slate-500 text-sm mb-6">Sei sicuro di voler eliminare questo appuntamento? L'operazione non può essere annullata.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal({isOpen: false, id: null})} className="flex-1 py-2 rounded-xl font-bold text-slate-600 bg-slate-100">Annulla</button>
              <button onClick={() => {
                handleDelete(deleteModal.id!); 
                setDeleteModal({isOpen: false, id: null});
              }} className="flex-1 py-2 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700">
                Elimina
              </button>
            </div>
          </div>
        </div>
      )}  
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-96 p-8 shadow-2xl">
            <div className="flex justify-between mb-6">
              <h3 className="font-black text-lg">Nuovo Appuntamento</h3>
              <button onClick={() => setIsAddModalOpen(false)}><X className="text-slate-400" /></button>
            </div>
            
            <form onSubmit={handleBooking} className="space-y-4">
              <div className="relative space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Cerca Cliente</label>
                <input 
                  type="text"
                  className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsListOpen(true);
                  }}
                />
                {isListOpen && searchTerm && (
                  <div className="absolute z-50 w-full bg-white border border-slate-200 rounded-xl mt-1 shadow-xl max-h-40 overflow-y-auto">
                    {customers
                      .filter(c => `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map(c => (
                        <div key={c.id} className="p-3 hover:bg-blue-50 cursor-pointer border-b" onClick={() => {
                          setFormData({...formData, customer_id: c.id});
                          setSearchTerm(`${c.first_name} ${c.last_name}`);
                          setIsListOpen(false);
                        }}>
                          <div className="font-bold text-sm">{c.first_name} {c.last_name}</div>
                          <div className="text-[10px] text-slate-400">{c.email}</div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              <select className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200" onChange={e => setFormData({...formData, service_id: e.target.value})} required>
                <option value="">Seleziona Servizio</option>
                {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>

              <input type="datetime-local" className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200" onChange={e => setFormData({...formData, booking_datetime: e.target.value})} required />
       
              {errorConflict && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                  <X size={18} className="shrink-0" />
                  <span className="text-xs font-bold">{errorConflict}</span>
                </div>
              )}
              <button className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition">
                {isAdmin ? 'Crea Prenotazione' : 'Invia Richiesta'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;

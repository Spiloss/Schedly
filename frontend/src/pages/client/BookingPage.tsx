import { useState, useEffect } from 'react';
import { Package, ArrowLeft, Clock, CalendarDays, CheckCircle2, AlertTriangle } from 'lucide-react';
import { getStoredUser } from '../../utils/auth';
import { apiUrl } from '../../utils/api';

const BookingPage = () => {
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [formData, setFormData] = useState({ booking_datetime: '' });
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetch(apiUrl('/services'))
      .then(res => res.json())
      .then(data => setServices(data));
  }, []);

  const handleBooking = async () => {
    if (!formData.booking_datetime || formData.booking_datetime.trim() === "") {
      setIsError(true);
      setErrorMessage("Per favore, seleziona una data e un'ora.");
      return;
    }
    
    setIsError(false);
    const user = getStoredUser() || {};

    try {
      const response = await fetch(apiUrl('/bookings'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: user.id,
          service_id: selectedService.id,
          booking_datetime: new Date(formData.booking_datetime).toISOString(),
          status: 'pending'
        })
      });

      if (response.ok) {
        setShowSuccess(true);
      } else if (response.status === 409) {
        setIsError(true);
        setErrorMessage("Gentile cliente, questo orario non è disponibile. Scegli un altro momento.");
      } else {
        const errorData = await response.json();
        alert("Errore durante la prenotazione: " + (errorData.error || "Riprova."));
      }
    } catch (error) {
      alert("Errore di connessione al server.");
    }
  };

  return (
    <div className="w-full">
  
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-800">
          {selectedService ? 'Conferma Prenotazione' : 'I Nostri Servizi'}
        </h1>
        <p className="text-slate-500 font-medium mt-2">
          {selectedService 
            ? `Hai selezionato: ${selectedService.name}. Scegli data e ora per proseguire.` 
            : 'Seleziona l\'attività di tuo interesse dal catalogo sottostante.'}
        </p>
      </div>

      {!selectedService ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {services.map((s) => (
            <button 
              key={s.id} 
              onClick={() => setSelectedService(s)} 
              className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:border-slate-400 transition-all hover:shadow-md text-left group"
            >
              <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-slate-900 group-hover:text-white transition">
                <Package size={24} />
              </div>
              <h3 className="font-bold text-lg text-slate-800">{s.name}</h3>
              <div className="mt-4 flex items-center gap-4 text-slate-400 font-bold text-sm">
                <span className="flex items-center gap-1"><Clock size={16} /> {s.duration} min</span>
                <span>{s.price} €</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm w-full max-w-xl">
          <button 
            onClick={() => { setSelectedService(null); setIsError(false); }} 
            className="flex items-center gap-2 text-slate-500 font-bold mb-8 hover:text-slate-900 transition"
          >
            <ArrowLeft size={18} /> Torna indietro
          </button>
          
          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                <CalendarDays size={16} /> Data e Ora
              </label>
              <input 
                type="datetime-local" 
                className={`w-full p-4 bg-slate-50 border rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-slate-900 outline-none transition ${isError ? 'border-red-500' : 'border-slate-200'}`}
                onChange={e => { setFormData({booking_datetime: e.target.value}); setIsError(false); }} 
              />
              {isError && (
                <p className="mt-2 text-xs font-bold text-red-500 flex items-center gap-2">
                  <AlertTriangle size={14} /> {errorMessage}
                </p>
              )}
            </div>
            
            <button 
              onClick={handleBooking} 
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition shadow-lg"
            >
              Conferma Prenotazione
            </button>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-sm">
            <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-black text-slate-800">Prenotazione effettuata!</h2>
            <button 
              onClick={() => { setShowSuccess(false); setSelectedService(null); }}
              className="mt-6 w-full bg-slate-900 text-white py-3 rounded-xl font-bold"
            >
              Chiudi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;

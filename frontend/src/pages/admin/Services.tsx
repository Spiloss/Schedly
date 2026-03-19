import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Clock, X, AlertTriangle } from 'lucide-react';
import { apiUrl } from '../../utils/api';

const Services = () => {
  const [services, setServices] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editService, setEditService] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const [formData, setFormData] = useState({ name: '', description: '', price: 0, duration: 30 });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetch(apiUrl('/services'))
      .then(res => res.json())
      .then(setServices)
      .catch(() => showToast("Errore caricamento dati", "error"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return showToast("Il nome è obbligatorio", "error");
    if (formData.price < 0 || formData.duration < 1) return showToast("Dati non validi", "error");

    setIsLoading(true);
    const url = editService ? apiUrl(`/services/${editService.id}`) : apiUrl('/services');
    const method = editService ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = res.status !== 204 ? await res.json() : formData;
        if (editService) {
          setServices(services.map(s => s.id === editService.id ? data : s));
        } else {
          setServices([...services, data]);
        }
        showToast("Operazione completata!", "success");
        closeModals();
      } else {
        const errorData = await res.json();
        showToast(errorData.error || "Errore nel salvataggio", "error");
      }
    } catch {
      showToast("Errore di connessione", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsLoading(true);
    const res = await fetch(apiUrl(`/services/${deleteId}`), { method: 'DELETE' });
    
    if (res.ok) {
      setServices(services.filter(s => s.id !== deleteId));
      setDeleteId(null);
      showToast("Servizio eliminato", "success");
    } else {
      showToast("Errore durante l'eliminazione", "error");
    }
    setIsLoading(false);
  };

  const closeModals = () => {
    setIsAddModalOpen(false);
    setEditService(null);
    setFormData({ name: '', description: '', price: 0, duration: 30 });
  };

  const openEdit = (s: any) => {
    setEditService(s);
    setFormData(s);
  };

  return (
    <div className="flex h-screen bg-gray-50 text-slate-900">  
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <h1 className="text-xl font-black">Gestione Servizi</h1>
          <span className="px-4 py-1 text-xs font-bold bg-slate-100 rounded-full uppercase text-slate-500">Catalogo</span>
        </header>

        <div className="flex-1 p-8 overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black">Tutti i Servizi ({services.length})</h2>
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition">
              <Plus size={18} /> Aggiungi Servizio
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <div key={s.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-500 transition">
                <h4 className="font-bold text-lg">{s.name}</h4>
                <p className="text-sm text-slate-400 mt-1 mb-4 h-10 line-clamp-2">{s.description}</p>
                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><Clock size={12} /> {s.duration} MIN</span>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(s)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><Pencil size={16} /></button>
                    <button onClick={() => setDeleteId(s.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-500"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {toast && (
        <div className={`fixed bottom-8 right-8 px-6 py-3 rounded-2xl shadow-2xl text-white font-bold z-[100] animate-bounce ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.message}
        </div>
      )}

      {(isAddModalOpen || editService) && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl w-96 shadow-2xl overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-black text-lg">{editService ? 'Modifica Servizio' : 'Nuovo Servizio'}</h3>
              <button onClick={closeModals} className="text-slate-400 hover:text-slate-900"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              <input className="w-full p-3 bg-slate-50 rounded-xl" placeholder="Nome" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              <textarea className="w-full p-3 bg-slate-50 rounded-xl h-24" placeholder="Descrizione" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" min="0" className="w-full p-3 bg-slate-50 rounded-xl" placeholder="€" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                <input type="number" min="5" className="w-full p-3 bg-slate-50 rounded-xl" placeholder="Min" value={formData.duration} onChange={e => setFormData({...formData, duration: Number(e.target.value)})} />
              </div>
              <button type="submit" disabled={isLoading} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50">
                {isLoading ? 'Salvataggio...' : 'Salva Modifiche'}
              </button>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-3xl w-80 shadow-2xl text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle /></div>
            <h4 className="font-bold mb-2">Eliminare?</h4>
            <div className="flex gap-2">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2 bg-gray-100 rounded-xl font-bold">Annulla</button>
              <button onClick={confirmDelete} disabled={isLoading} className="flex-1 py-2 bg-red-600 text-white rounded-xl font-bold disabled:opacity-50">
                {isLoading ? '...' : 'Elimina'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;

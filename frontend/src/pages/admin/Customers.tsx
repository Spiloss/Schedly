import { useEffect, useState } from 'react';
import { UserPlus, Search, Mail, Phone, Trash2, Edit2 } from 'lucide-react';
import { apiUrl } from '../../utils/api';

interface Customer {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  notes: string;
  created_at?: string;
}

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [newCustomer, setNewCustomer] = useState<Customer>({
    first_name: '', last_name: '', email: '', phone: '', notes: ''
  });

  const fetchCustomers = () => {
    fetch(apiUrl('/customers'))
      .then(res => res.json())
      .then(setCustomers);
  };

  useEffect(() => { fetchCustomers(); }, []);

  const validate = () => {
    const newErrors = {
      first_name: !newCustomer.first_name,
      last_name: !newCustomer.last_name
    };
    setErrors(newErrors);
    return !Object.values(newErrors).includes(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const method = newCustomer.id ? 'PATCH' : 'POST';
    const url = newCustomer.id ? apiUrl(`/customers/${newCustomer.id}`) : apiUrl('/customers');
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCustomer),
    });
    
    fetchCustomers();
    setIsModalOpen(false);
    setNewCustomer({ first_name: '', last_name: '', email: '', phone: '', notes: '' });
  };
const [deleteCustomerId, setDeleteCustomerId] = useState<string | null>(null);
const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
const [isDeleting, setIsDeleting] = useState(false);
const openDeleteModal = (id: string) => {
  setDeleteCustomerId(id);
  setIsDeleteModalOpen(true);
};

const confirmDelete = async () => {
  if (deleteCustomerId) {
    setIsDeleting(true); 
    await fetch(apiUrl(`/customers/${deleteCustomerId}`), { method: 'DELETE' });
    fetchCustomers();
    setIsDeleting(false);
    setIsDeleteModalOpen(false);
    setDeleteCustomerId(null);
  }
};
 
  const filteredCustomers = customers.filter(c => 
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-50">
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-800">Anagrafica Clienti</h1>
            <p className="text-slate-500 text-sm">Gestisci i tuoi contatti e la loro storia</p>
          </div>
          <button 
            onClick={() => {
              setNewCustomer({ first_name: '', last_name: '', email: '', phone: '', notes: '' });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
          >
            <UserPlus size={20} /> Nuovo Cliente
          </button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Cerca cliente per nome o cognome..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map(customer => (
            <div key={customer.id} className="bg-white p-6 rounded-3xl border border-slate-200 hover:shadow-xl transition-shadow group relative">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center font-bold text-xl">
                  {customer.first_name[0]}{customer.last_name[0]}
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">{customer.first_name} {customer.last_name}</h3>
              <div className="space-y-2 mb-4 text-sm text-slate-500">
                <div><Mail size={14} className="inline mr-2"/> {customer.email || 'Nessuna email'}</div>
                <div><Phone size={14} className="inline mr-2"/> {customer.phone || 'Nessun telefono'}</div>
              </div>
              <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-slate-400">Cliente dal {customer.created_at ? new Date(customer.created_at).toLocaleDateString() : 'N/A'}</span>
                <div className="flex gap-2">
                  <button onClick={() => { setNewCustomer(customer); setIsModalOpen(true); }} className="text-indigo-400 hover:text-indigo-600 transition"><Edit2 size={16} /></button>
                 <button onClick={() => openDeleteModal(customer.id!)} className="text-red-400 hover:text-red-600 transition">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[32px] w-full max-w-lg p-10 shadow-2xl">
              <h2 className="text-2xl font-black mb-6 text-slate-800">{newCustomer.id ? 'Modifica Cliente' : 'Nuovo Cliente'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nome</label>
                    <input className={`w-full p-4 bg-slate-50 rounded-2xl border ${errors.first_name ? 'border-red-500' : 'border-slate-100'} outline-none`} value={newCustomer.first_name} onChange={e => setNewCustomer({...newCustomer, first_name: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Cognome</label>
                    <input className={`w-full p-4 bg-slate-50 rounded-2xl border ${errors.last_name ? 'border-red-500' : 'border-slate-100'} outline-none`} value={newCustomer.last_name} onChange={e => setNewCustomer({...newCustomer, last_name: e.target.value})} />
                  </div>
                </div>
                <input className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none" type="email" placeholder="Email" value={newCustomer.email} onChange={e => setNewCustomer({...newCustomer, email: e.target.value})} />
                <input className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 outline-none" placeholder="Telefono" value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} />
                
                <div className="flex gap-4 mt-8">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl">Annulla</button>
                  <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg">Salva Contatto</button>
                </div>
              </form>
            </div>
          </div>
        )}
        {isDeleteModalOpen && (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-[32px] w-full max-w-sm p-8 text-center shadow-2xl">
      <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <Trash2 size={32} />
      </div>
      <h2 className="text-xl font-black text-slate-800 mb-2">Elimina cliente</h2>
      <p className="text-slate-500 mb-8 text-sm">Sei sicuro? Questa azione è irreversibile e cancellerà tutti i dati del cliente.</p>
      
      <div className="flex gap-4">
        <button 
          onClick={() => setIsDeleteModalOpen(false)} 
          className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition"
        >
          Annulla
        </button>
        <button 
          onClick={confirmDelete} 
          disabled={isDeleting}
          className="flex-1 py-3 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 shadow-lg shadow-red-100 transition"
        >
         {isDeleting ? 'Eliminazione...' : 'Elimina'}
        </button>
      </div>
    </div>
  </div>
)}
      </main>
    </div>
  );
};

export default Customers;

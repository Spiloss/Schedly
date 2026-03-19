import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiUrl } from '../utils/api';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(apiUrl('/auth/signup'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          email, 
          password, 
          first_name: firstName, 
          last_name: lastName, 
          phone 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Account creato con successo!");
        navigate('/login');
      } else {
        alert(data.error || "Errore nella registrazione");
      }
    } catch {
      alert("Il server non risponde. Controlla se il backend è acceso!");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-lg">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">Unisciti a Schedly</h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input 
            type="text" 
            placeholder="Nome" 
            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
            value={firstName} 
            onChange={(e) => setFirstName(e.target.value)} 
            required 
          />
          <input 
            type="text" 
            placeholder="Cognome" 
            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
            value={lastName} 
            onChange={(e) => setLastName(e.target.value)} 
            required 
          />
          <input 
            type="tel" 
            placeholder="Telefono" 
            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            required 
          />
          <input 
            type="email" 
            placeholder="Email" 
            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          
          <div className="relative w-full">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-600"
            >
              {showPassword ? "Nascondi" : "Mostra"}
            </button>
          </div>

          <button 
            type="submit" 
            className="mt-2 w-full rounded-lg bg-green-600 p-3 font-bold text-white hover:bg-green-700 transition-all"
          >
            Crea Account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Hai già un account? <Link to="/login" className="font-bold text-blue-600 hover:underline">Accedi</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

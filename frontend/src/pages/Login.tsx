import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { setStoredAuth } from '../utils/auth';
import { apiUrl } from '../utils/api';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(apiUrl('/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json(); 

      if (response.ok) {
        setStoredAuth(data.user, data.session);
        
        if (data.user.role === 'admin') {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/booking', { replace: true });
        }
      } else {
        alert(data.error || "Credenziali non valide");
      }
    } catch {
      alert("Errore di connessione col server.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-lg text-center">
        <h2 className="mb-2 text-2xl font-bold text-gray-900">Accedi a Schedly</h2>
        <p className="mb-8 text-sm text-gray-500">Gestisci i tuoi appuntamenti in un click</p>
        
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input 
            type="email" 
            placeholder="Email" 
            className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          
          <div className="relative flex">
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-blue-600 hover:text-blue-800"
            >
              {showPassword ? "Nascondi" : "Mostra"}
            </button>
          </div>

          <button 
            type="submit" 
            className="w-full rounded-lg bg-blue-600 p-3 font-bold text-white hover:bg-blue-700 transition-all"
          >
            Entra
          </button>
        </form>

        <p className="mt-6 text-sm text-gray-500">
          Non hai un account? <Link to="/register" className="font-bold text-blue-600 hover:underline">Registrati qui</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

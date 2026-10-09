"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter(); 
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [message, setMessage] = useState({ text: '', type: '' }); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: 'In elaborazione...', type: 'info' });

    if (isRegistering) {
      // LOGICA DI REGISTRAZIONE
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        const data = await res.json();
        
        if (res.ok) {
          setMessage({ text: '✅ Registrazione completata. Controlla la tua casella email.', type: 'success' });
          setFormData({ username: '', email: '', password: '' });
          setTimeout(() => setIsRegistering(false), 3000);
        } else {
          setMessage({ text: `❌ Errore: ${data.error || 'Dati non validi'}`, type: 'error' });
        }
      } catch (err) {
        setMessage({ text: '❌ Impossibile connettersi al server centrale.', type: 'error' });
      }
    } else {
      // LOGICA DI LOGIN DEFINITIVA
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password })
        });
        
        const data = await res.json();

        if (res.ok) {
          setMessage({ text: '✅ Accesso Garantito. Sincronizzazione in corso...', type: 'success' });
          
          localStorage.setItem('jumper_user', JSON.stringify(data));
          
          // MODIFICA QUI: Reindirizza l'utente al Feed dopo 1.5 secondi
          setTimeout(() => {
            router.push('/feed');
          }, 1500);
        } else {
          setMessage({ text: `❌ Accesso Negato: ${data.error}`, type: 'error' });
        }
      } catch (err) {
        setMessage({ text: '❌ Impossibile connettersi al server centrale.', type: 'error' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-mono">
      <div className="w-full max-w-md bg-slate-900 border border-cyan-500/30 p-8 rounded-xl shadow-[0_0_40px_rgba(6,182,212,0.1)]">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-cyan-400 tracking-widest uppercase mb-2">
            {isRegistering ? 'Nuovo Terminale' : 'Accesso Rete'}
          </h1>
          <p className="text-slate-400 text-xs uppercase tracking-widest">
            {isRegistering ? 'Inizializza le tue credenziali' : 'Inserisci credenziali di accesso'}
          </p>
        </div>

        {message.text && (
          <div className={`p-4 mb-6 rounded text-sm font-bold border ${
            message.type === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 
            message.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 
            'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 animate-pulse'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div>
              <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Username</label>
              <input 
                type="text" 
                required 
                className="w-full bg-slate-950 border border-slate-800 p-3 text-cyan-50 rounded outline-none focus:border-cyan-500"
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
              />
            </div>
          )}

          <div>
            <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Indirizzo Email</label>
            <input 
              type="email" 
              required 
              className="w-full bg-slate-950 border border-slate-800 p-3 text-cyan-50 rounded outline-none focus:border-cyan-500"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="text-xs text-slate-500 uppercase font-bold mb-1 block">Codice Criptato (Password)</label>
            <input 
              type="password" 
              required 
              className="w-full bg-slate-950 border border-slate-800 p-3 text-cyan-50 rounded outline-none focus:border-cyan-500"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button type="submit" className="w-full bg-cyan-600 text-slate-950 font-bold uppercase tracking-widest p-4 rounded hover:bg-cyan-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all mt-4">
            {isRegistering ? 'Invia Richiesta' : 'Autenticazione'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-800 pt-6">
          <button 
            onClick={() => { setIsRegistering(!isRegistering); setMessage({ text: '', type: '' }); }}
            className="text-cyan-500/70 hover:text-cyan-400 text-xs uppercase tracking-widest transition-colors"
          >
            {isRegistering ? '[ Torna al Login ]' : '[ Richiedi nuovo accesso ]'}
          </button>
        </div>
      </div>
      
      <Link href="/" className="mt-8 text-slate-600 hover:text-slate-400 text-xs uppercase tracking-widest">
        &larr; Annulla e torna alla Home
      </Link>
    </div>
  );
}
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    website: '',
    avatar: ''
  });
  const [status, setStatus] = useState('');
  const router = useRouter();

  // 1. Carica i dati dell'utente all'avvio
  useEffect(() => {
    // ✨ CORREZIONE: Usa 'jumper_user'
    const savedUser = localStorage.getItem('jumper_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setFormData({
        username: parsed.username || '',
        bio: parsed.bio || '',
        website: parsed.website || '',
        avatar: parsed.avatar || ''
      });
    } else {
      // Se non c'è l'utente, rimanda al login
      router.push('/login');
    }
  }, [router]);

  // 2. Gestione caricamento immagine (converte in Base64)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setStatus("❌ File troppo grande! Max 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // 3. Invio aggiornamento al server
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('📡 TRASMISSIONE_DATI_IN_CORSO...');

    try {
      const res = await fetch(`http://localhost:3001/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const updatedData = await res.json();

      if (res.ok) {
        // ✨ CORREZIONE: Aggiorna la chiave corretta nel localStorage
        localStorage.setItem('jumper_user', JSON.stringify(updatedData));
        setStatus('✅ PROTOCOLLO_AGGIORNATO_CON_SUCCESSO');
        
        // MODIFICA QUI: Torna al feed dopo un secondo e mezzo
        setTimeout(() => {
          router.push('/feed');
        }, 1500);
      } else {
        setStatus(`❌ ERRORE: ${updatedData.error || 'Fallimento sincronizzazione'}`);
      }
    } catch (err) {
      console.error(err);
      setStatus('❌ CRASH_DI_RETE: Impossibile raggiungere il server');
    }
  };

  if (!user) return <div className="p-10 text-cyan-500 font-mono">INIZIALIZZAZIONE_PROFILO...</div>;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 font-mono p-4 md:p-10">
      <div className="max-w-2xl mx-auto bg-slate-900 border border-cyan-500/20 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header Estetico */}
        <div className="bg-cyan-900/20 p-6 border-b border-cyan-500/20">
          <h1 className="text-2xl font-black text-cyan-400 tracking-tighter uppercase">
            User_Profile_Editor.exe
          </h1>
          <p className="text-xs text-cyan-600 mt-1">ID_SESSIONE: {user.id} | STATUS: ONLINE</p>
        </div>

        <form onSubmit={handleUpdate} className="p-8 space-y-6">
          
          {/* SEZIONE AVATAR */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-4 border-cyan-500/50 overflow-hidden bg-slate-800 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl bg-slate-800">👤</div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-cyan-500 p-2 rounded-full cursor-pointer hover:bg-cyan-400 transition-colors shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>
            <p className="text-[10px] text-slate-500 uppercase">Carica nuova immagine profilo (PNG/JPG)</p>
          </div>

          {/* INPUT FIELDS */}
          <div className="grid grid-cols-1 gap-6">
            
            {/* Username */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-cyan-500 uppercase tracking-widest">Username_Identificativo</label>
              <input 
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg focus:border-cyan-500 outline-none transition-all text-cyan-100"
                placeholder="Inserisci username..."
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-cyan-500 uppercase tracking-widest">Bio / Protocollo_Personale</label>
              <textarea 
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg focus:border-cyan-500 outline-none h-24 transition-all text-cyan-100"
                placeholder="Scrivi qualcosa su di te..."
              />
            </div>

            {/* Sito Web */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-cyan-500 uppercase tracking-widest">Sito_Web_URL</label>
              <input 
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({...formData, website: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg focus:border-cyan-500 outline-none transition-all text-cyan-100"
                placeholder="https://..."
              />
            </div>

          </div>

          {/* Status Message */}
          {status && (
            <div className={`p-3 rounded text-center text-xs font-bold border ${status.includes('✅') ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-red-500/10 border-red-500/50 text-red-400'}`}>
              {status}
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              type="submit" 
              className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black p-4 rounded-xl uppercase tracking-tighter transition-all active:scale-95 shadow-lg shadow-cyan-500/20"
            >
              Aggiorna_Protocollo
            </button>
            <button 
              type="button"
              onClick={() => router.push('/feed')} // MODIFICA QUI
              className="px-8 border border-slate-700 hover:border-slate-500 text-slate-500 hover:text-slate-200 p-4 rounded-xl uppercase text-sm transition-all"
            >
              Annulla
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}
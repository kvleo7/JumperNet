// frontend/components/Navbar.tsx
"use client";
import { useState } from 'react';
import Link from 'next/link';
import { User } from '../types';

interface NavbarProps {
  user: User;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  setIsModalOpen: (isOpen: boolean) => void;
  setIsSettingsOpen: (isOpen: boolean) => void;
  setIsChatOpen: (isOpen: boolean) => void; 
}

export default function Navbar({ 
  user, 
  searchTerm, 
  setSearchTerm, 
  setIsModalOpen, 
  setIsSettingsOpen,
  setIsChatOpen 
}: NavbarProps) {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  // Dati fittizi per le notifiche
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Marco ha iniziato a seguirti.", read: false },
    { id: 2, text: "Anna ha messo like al tuo post.", read: true },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-slate-900/80 border-b border-cyan-500/20 p-4 flex flex-col md:flex-row gap-4 justify-between items-center sticky top-0 z-40 backdrop-blur-xl">
      <h1 className="font-black text-cyan-400 text-2xl tracking-tighter shrink-0">JUMPER_NET v2.1</h1>
      
      {/* BARRA DI RICERCA (Più grande e centrale) */}
      <div className="relative w-full md:max-w-xl lg:max-w-2xl group flex flex-col flex-1 mx-4">
        <div className="relative w-full">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500/50 group-focus-within:text-cyan-400 transition-colors text-lg">🔍</span>
          <input 
            type="text"
            placeholder="CERCA O DIGITA @UTENTE..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950/50 border border-slate-700 py-3 pl-12 pr-4 rounded-full text-xs uppercase font-bold tracking-widest text-cyan-400 outline-none focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
          />
        </div>
        <span className="absolute -bottom-5 left-4 text-[9px] text-cyan-500/60 uppercase tracking-wider font-bold">
          * Usa @nomeutente per cercare
        </span>
      </div>

      <div className="flex gap-4 items-center relative">
        
        {/* BOTTONE DELLA CHAT CON TESTO */}
        <button 
          onClick={() => setIsChatOpen(true)} 
          className="flex items-center gap-2 text-slate-300 hover:text-cyan-400 transition-colors group cursor-pointer"
          title="Apri Trasmissioni"
        >
          <span className="text-xl group-hover:scale-110 transition-transform">💬</span>
          <span className="text-[10px] font-bold uppercase tracking-wider hidden lg:block text-slate-400 group-hover:text-cyan-400 transition-colors">Chat</span>
        </button>

        {/* MENU NOTIFICHE CON TESTO */}
        <div className="relative flex items-center">
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)} 
            className="flex items-center gap-2 text-slate-300 hover:text-pink-500 transition-colors group relative cursor-pointer"
          >
            <div className="relative">
              <span className="text-xl group-hover:scale-110 transition-transform block">❤️</span>
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-slate-900">
                  {unreadCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider hidden lg:block text-slate-400 group-hover:text-pink-500 transition-colors">Notifiche</span>
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 top-10 mt-3 w-64 bg-slate-900 border border-cyan-500/30 rounded-lg shadow-2xl overflow-hidden z-50">
              <div className="p-2 border-b border-slate-800 text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Centro_Notifiche</div>
              <div className="max-h-48 overflow-y-auto">
                {notifications.map(notif => (
                  <div key={notif.id} className={`p-3 text-xs border-b border-slate-800/50 hover:bg-slate-800 cursor-pointer ${!notif.read ? 'text-white font-bold bg-slate-800/30' : 'text-slate-400'}`}>
                    {notif.text}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ALTRI TASTI NAVBAR */}
        <Link href="/my-projects" className="bg-slate-800 border border-slate-600 text-slate-300 px-4 py-2 rounded font-bold text-[10px] uppercase hover:bg-cyan-900/50 hover:text-cyan-400 hover:border-cyan-500 transition-all shadow-lg hidden sm:block">
          📁 I Miei Progetti
        </Link>
        <button onClick={() => setIsModalOpen(true)} className="bg-cyan-500 text-slate-950 px-4 py-2 rounded font-bold text-xs uppercase hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all cursor-pointer">
          + NUOVO_POST
        </button>
        <Link href="/profile" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-widest text-xs font-bold border-l border-slate-700 pl-4 ml-2">
          {user?.avatar ? (
            <img src={user.avatar} className="w-8 h-8 rounded-full border border-cyan-500/50 object-cover" alt="avatar" />
          ) : (
            <span className="text-xl">👤</span>
          )}
          <span className="hidden md:inline">{user?.username}</span>
        </Link>
        <button onClick={() => setIsSettingsOpen(true)} className="text-cyan-500 text-xl hover:scale-110 transition-transform ml-2 cursor-pointer">⚙️</button>
      </div>
    </header>
  );
}
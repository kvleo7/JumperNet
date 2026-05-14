"use client";

import React, { useState } from 'react';

// --- TIPI E DATI FINTI ---
type NotificationType = 'like' | 'comment' | 'follow' | 'system';

interface Notification {
  id: string;
  type: NotificationType;
  actor?: { username: string; avatar: string };
  content: string;
  target?: string; // Es: il nome del progetto
  timeAgo: string;
  isRead: boolean;
}

export default function CyberNotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'mentions' | 'system'>('all');

  const notifications: Notification[] = [
    {
      id: '1',
      type: 'system',
      content: 'AGGIORNAMENTO SISTEMA: Deploy v2.0.4 completato. Nuovi filtri di ricerca online.',
      timeAgo: '10 MIN FA',
      isRead: false,
    },
    {
      id: '2',
      type: 'like',
      actor: { username: 'sarah_codes', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
      content: 'ha lasciato un reazione di bypass al tuo progetto',
      target: 'Sensore Ambientale ESP32',
      timeAgo: '2 ORE FA',
      isRead: false,
    },
    {
      id: '3',
      type: 'comment',
      actor: { username: 'pietro_3d', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pietro' },
      content: 'ha decriptato il tuo codice e commentato: "Ottima logica per i motori stepper!"',
      target: 'Snippet Python CNC',
      timeAgo: '5 ORE FA',
      isRead: true,
    },
    {
      id: '4',
      type: 'follow',
      actor: { username: 'arduino_master', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arduino' },
      content: 'ha stabilito una connessione con il tuo nodo. Ora ti segue.',
      timeAgo: '1 GIORNO FA',
      isRead: true,
    },
    {
      id: '5',
      type: 'like',
      actor: { username: 'lucy_circuits', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucy' },
      content: 'ha approvato il tuo schema',
      target: 'Circuito Amplificatore Audio',
      timeAgo: '2 GIORNI FA',
      isRead: true,
    }
  ];

  // Filtriamo le notifiche in base al tab selezionato
  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'system') return n.type === 'system';
    if (filter === 'mentions') return n.type === 'comment' || n.type === 'follow';
    return true;
  });

  // Funzione per assegnare il colore/icona in base al tipo
  const getStyleByType = (type: NotificationType) => {
    switch (type) {
      case 'like': return { color: 'text-fuchsia-500', bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/30', icon: '♥' };
      case 'comment': return { color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/30', icon: '≡' };
      case 'follow': return { color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30', icon: '◬' };
      case 'system': return { color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30', icon: '⚠' };
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 font-sans selection:bg-cyan-500/30">
      
      {/* HEADER TERMINALE */}
      <header className="sticky top-0 z-50 bg-[#050505]/90 backdrop-blur-md border-b border-cyan-900/50 pt-6 pb-4">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tighter text-cyan-400">NET_ALERTS</h1>
            <p className="text-[10px] font-mono text-cyan-700 uppercase tracking-widest mt-1">
              Status: <span className="text-emerald-500 animate-pulse">Online</span> // Log eventi
            </p>
          </div>
          <div className="text-xs font-mono text-slate-500 border border-slate-800 px-3 py-1 bg-black">
            {notifications.filter(n => !n.isRead).length} NON LETTI
          </div>
        </div>
        
        {/* TABS FILTRO */}
        <div className="max-w-3xl mx-auto px-4 mt-6 flex gap-6 text-sm font-mono uppercase tracking-wider">
          <button 
            onClick={() => setFilter('all')}
            className={`pb-2 transition-all ${filter === 'all' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-600 hover:text-cyan-700'}`}
          >
            Tutto_I/O
          </button>
          <button 
            onClick={() => setFilter('mentions')}
            className={`pb-2 transition-all ${filter === 'mentions' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-600 hover:text-cyan-700'}`}
          >
            Connessioni
          </button>
          <button 
            onClick={() => setFilter('system')}
            className={`pb-2 transition-all ${filter === 'system' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-600 hover:text-cyan-700'}`}
          >
            Sistema
          </button>
        </div>
      </header>

      {/* LISTA NOTIFICHE */}
      <main className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-3">
        {filteredNotifications.map((notif) => {
          const style = getStyleByType(notif.type);
          
          return (
            <div 
              key={notif.id} 
              className={`relative p-4 flex gap-4 items-start bg-black border ${notif.isRead ? 'border-slate-800/50' : style.border} hover:bg-slate-900/50 transition-colors group cursor-pointer`}
            >
              {/* Indicatore "Non Letto" (Glow Laterale) */}
              {!notif.isRead && (
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${style.bg} shadow-[0_0_10px_currentColor] ${style.color}`}></div>
              )}

              {/* Icona Tipo Notifica */}
              <div className={`w-10 h-10 shrink-0 flex items-center justify-center font-mono text-xl border ${style.border} ${style.bg} ${style.color}`}>
                {notif.type === 'system' ? (
                  style.icon
                ) : (
                  <img src={notif.actor?.avatar} alt="User" className="w-full h-full object-cover opacity-80 mix-blend-screen" />
                )}
              </div>

              {/* Contenuto */}
              <div className="flex-1">
                <p className="text-sm">
                  {notif.actor && (
                    <span className="font-bold text-slate-100 mr-2 hover:text-cyan-400 transition-colors">
                      @{notif.actor.username}
                    </span>
                  )}
                  <span className="text-slate-400">{notif.content}</span>
                  {notif.target && (
                    <span className={`ml-2 font-mono text-xs px-2 py-0.5 bg-slate-900 border ${style.border} ${style.color}`}>
                      [{notif.target}]
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`${style.color} text-xs`}>{style.icon}</span>
                  <span className="font-mono text-[10px] text-slate-600">{notif.timeAgo}</span>
                </div>
              </div>

              {/* Azioni rapide su hover (Solo visibili col mouse sopra) */}
              <div className="hidden sm:flex opacity-0 group-hover:opacity-100 transition-opacity items-center gap-2">
                 <button className="text-[10px] font-mono border border-cyan-900 text-cyan-500 hover:bg-cyan-950 px-2 py-1 transition-colors">
                    &gt; INIZIALIZZA
                 </button>
              </div>

            </div>
          );
        })}

        {filteredNotifications.length === 0 && (
          <div className="text-center py-12 font-mono text-slate-600 border border-slate-800 bg-black border-dashed">
            [ NESSUN RECORD TROVATO NEI LOG ]
          </div>
        )}
      </main>
      
    </div>
  );
}
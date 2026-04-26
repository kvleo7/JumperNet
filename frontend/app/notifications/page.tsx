// frontend/app/notifications/page.tsx
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AppNotification {
  id: number;
  type: 'follow' | 'like' | 'comment' | 'share';
  actorName: string; // Chi ha fatto l'azione
  actorAvatar?: string;
  projectId?: number; // Se riguarda un progetto
  projectName?: string;
  message?: string; // Per i commenti
  time: string;
  isRead: boolean;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  
  // Dati simulati (in futuro farai un fetch da http://localhost:3001/api/notifications?userId=...)
  const [notifications, setNotifications] = useState<AppNotification[]>([
    { id: 1, type: 'follow', actorName: 'Neo_Hacker', time: '2 min fa', isRead: false },
    { id: 2, type: 'like', actorName: 'Trinity99', projectId: 101, projectName: 'Script_Python_AI', time: '1 ora fa', isRead: false },
    { id: 3, type: 'comment', actorName: 'CyberPunk_01', projectId: 102, projectName: 'Interfaccia React', message: 'Assolutamente geniale il modo in cui hai gestito lo state!', time: '3 ore fa', isRead: true },
    { id: 4, type: 'share', actorName: 'Morpheus', projectId: 101, projectName: 'Script_Python_AI', time: 'Ieri', isRead: true },
  ]);

  useEffect(() => {
    const userStr = localStorage.getItem('jumper_user');
    if (userStr && userStr !== "undefined") {
      setCurrentUserId(JSON.parse(userStr).id);
    }
  }, []);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    // Qui andrà la chiamata API per aggiornare il DB
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'follow': return '👤';
      case 'like': return '❤️';
      case 'comment': return '💬';
      case 'share': return '✈️';
      default: return '🔔';
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 font-mono pb-20 pt-6 px-4">
      <div className="max-w-2xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => router.back()} className="text-cyan-500 hover:text-cyan-300 text-xs font-bold uppercase tracking-widest transition-transform hover:-translate-x-2">
            ← Indietro
          </button>
          <h1 className="text-xl font-black text-white uppercase tracking-[0.2em]">Registro_Eventi</h1>
          <button onClick={markAllAsRead} className="text-[10px] text-slate-500 hover:text-cyan-400 uppercase tracking-widest border border-slate-800 hover:border-cyan-500 px-3 py-1 rounded transition-all">
            Segna Letti
          </button>
        </div>

        {/* Lista Notifiche */}
        <div className="space-y-3">
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`p-4 rounded-xl border flex items-center gap-4 transition-all hover:scale-[1.01] cursor-pointer ${
                  notif.isRead 
                    ? 'bg-slate-900/50 border-slate-800' 
                    : 'bg-slate-800 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                }`}
              >
                <div className="text-2xl">{getNotificationIcon(notif.type)}</div>
                
                <div className="flex-1">
                  <p className="text-sm text-slate-300">
                    <span className="font-bold text-white hover:text-cyan-400">@{notif.actorName}</span>
                    {notif.type === 'follow' && ' ha iniziato a seguirti.'}
                    {notif.type === 'like' && ' ha messo like al tuo progetto '}
                    {notif.type === 'comment' && ' ha commentato '}
                    {notif.type === 'share' && ' ha condiviso il tuo progetto '}
                    
                    {notif.projectName && (
                      <span className="text-cyan-500 italic">"{notif.projectName}"</span>
                    )}
                  </p>
                  
                  {notif.message && (
                    <p className="text-xs text-slate-500 mt-1 border-l-2 border-slate-700 pl-2 italic">
                      "{notif.message}"
                    </p>
                  )}
                  
                  <span className="text-[10px] text-slate-600 uppercase tracking-widest mt-2 block">
                    {notif.time}
                  </span>
                </div>

                {!notif.isRead && (
                  <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,1)] animate-pulse"></div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-20 text-slate-600 uppercase tracking-widest text-xs border border-dashed border-slate-800 rounded-xl">
              Nessuna nuova notifica nel sistema.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
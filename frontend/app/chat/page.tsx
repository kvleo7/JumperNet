// frontend/app/chat/page.tsx
"use client";
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { User } from '../../types';

interface Message {
  id: number;
  text: string;
  senderId: number;
  receiverId: number;
  createdAt: string;
}

export default function ChatPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  
  const searchParams = useSearchParams();
  const targetIdFromUrl = searchParams.get('target');
  const router = useRouter();

  // 1. Recupera l'utente loggato
  useEffect(() => {
    const user = localStorage.getItem('jumper_user'); 
    if (user && user !== "undefined") {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  // 2. Carica i contatti e imposta l'utente target
  useEffect(() => {
    if (currentUser?.id) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`)
        .then(res => res.json())
        .then(data => {
          // FIX: Controlliamo che data sia un array prima di filtrare
          const validData = Array.isArray(data) ? data : [];
          const otherUsers = validData.filter((u: User) => u.id !== currentUser.id);
          setUsers(otherUsers);
          
          if (targetIdFromUrl) {
            const target = otherUsers.find((u: User) => u.id === Number(targetIdFromUrl));
            if (target) setSelectedUser(target);
          }
        })
        .catch(err => {
          console.error("Errore contatti:", err);
          setUsers([]);
        });
    }
  }, [currentUser, targetIdFromUrl]);

  // 3. Loop messaggi
  useEffect(() => {
    if (!currentUser?.id || !selectedUser) return;
    const fetchMessages = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages/${currentUser.id}/${selectedUser.id}`);
        const data = await res.json();
        // Protezione anche qui per evitare errori nel .map() del render
        setMessages(Array.isArray(data) ? data : []);
      } catch (err) { 
        console.error("Errore caricamento messaggi:", err); 
      }
    };
    
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedUser, currentUser]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !currentUser?.id) return;
    try {
      const res = await fetch('${process.env.NEXT_PUBLIC_API_URL}/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newMessage, senderId: currentUser.id, receiverId: selectedUser.id })
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages([...messages, msg]);
        setNewMessage("");
      }
    } catch (err) { console.error(err); }
  };

  if (!currentUser) return <div className="h-screen bg-slate-950 flex items-center justify-center text-cyan-500 font-mono tracking-widest uppercase">Connessione terminale in corso...</div>;

  return (
    <div className="h-screen w-screen bg-slate-950 flex overflow-hidden font-sans text-slate-200">
      
      {/* SIDEBAR SINISTRA: Lista Contatti */}
      <div className="w-1/4 max-w-[350px] border-r border-cyan-900/30 bg-slate-900/50 flex flex-col">
        <div className="p-6 border-b border-cyan-900/30">
          <button 
            onClick={() => router.push('/feed')} 
            className="flex items-center gap-2 text-[10px] text-cyan-500/70 hover:text-cyan-400 uppercase tracking-widest font-bold mb-4 transition-all"
          >
            <span>◀</span> RETE_PRINCIPALE
          </button>

          <h1 className="text-cyan-400 font-black tracking-tighter text-2xl">NET_MESSENGER</h1>
          <p className="text-[10px] text-cyan-600 uppercase tracking-widest mt-1">Nodi di rete attivi</p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {users.map(u => (
            <div 
              key={u.id}
              onClick={() => setSelectedUser(u)}
              className={`flex items-center gap-4 p-4 cursor-pointer transition-all border-b border-slate-800/50 ${
                selectedUser?.id === u.id ? 'bg-cyan-950/40 border-l-4 border-l-cyan-500' : 'hover:bg-slate-800/30'
              }`}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xl overflow-hidden">
                  {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" alt="avatar" /> : "👤"}
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-slate-950 rounded-full"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate uppercase tracking-wide">{u.username}</p>
                <p className="text-[10px] text-slate-500">Online</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AREA DESTRA: Chat principale */}
      <div className="flex-1 flex flex-col bg-slate-950 relative">
        {selectedUser ? (
          <>
            <div className="p-4 bg-slate-900/80 backdrop-blur-md border-b border-cyan-900/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-cyan-500 text-xs">CHANNEL_SECURE:</span>
                <span className="font-bold text-white uppercase tracking-widest text-sm">@{selectedUser.username}</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono uppercase tracking-tighter">
                ID_NODE: {selectedUser.id}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.03)_0,transparent_100%)]">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-4 rounded-2xl shadow-xl ${
                    m.senderId === currentUser.id 
                      ? 'bg-cyan-600 text-white rounded-br-none border border-cyan-400/30' 
                      : 'bg-slate-800/80 text-slate-200 rounded-bl-none border border-slate-700'
                  }`}>
                    <p className="text-sm leading-relaxed">{m.text}</p>
                    <span className="text-[9px] opacity-50 block mt-2 font-mono">
                      {new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-slate-900/50 border-t border-cyan-900/30">
              <form onSubmit={sendMessage} className="max-w-4xl mx-auto flex gap-3">
                <input 
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Invia pacchetto dati..."
                  className="flex-1 bg-black border border-slate-700 rounded-xl px-5 py-3 text-sm text-cyan-400 focus:border-cyan-500 outline-none transition-all shadow-inner"
                />
                <button 
                  type="submit" 
                  className="bg-cyan-500 text-black px-8 py-3 rounded-xl font-black text-xs hover:bg-cyan-400 transition-all uppercase tracking-widest"
                >
                  Trasmetti
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4 opacity-20">
             <div className="w-24 h-24 border-2 border-dashed border-cyan-500 rounded-full flex items-center justify-center animate-[spin_20s_linear_infinite]">
                <span className="text-4xl">📡</span>
             </div>
             <p className="text-cyan-500 font-bold tracking-[0.5em] text-sm uppercase">Seleziona un nodo per iniziare</p>
          </div>
        )}
      </div>
    </div>
  );
}
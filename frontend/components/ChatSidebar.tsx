// frontend/components/ChatSidebar.tsx
"use client";
import { useState, useEffect } from 'react';
import { User } from '../types';

interface Message {
  id: number;
  text: string;
  senderId: number;
  receiverId: number;
  createdAt: string;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null; 
  targetUserId?: number | null; 
}

export default function ChatSidebar({ isOpen, onClose, currentUser, targetUserId }: ChatSidebarProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (isOpen && currentUser?.id) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`)
        .then(res => res.json())
        .then(data => {
          const otherUsers = (Array.isArray(data) ? data : []).filter((u: User) => u.id !== currentUser.id);
          setUsers(otherUsers);
          if (targetUserId) {
            const target = otherUsers.find((u: User) => u.id === Number(targetUserId));
            if (target) setSelectedUser(target);
          }
        })
        .catch(err => console.error("Errore lista utenti:", err));
    }
  }, [isOpen, currentUser?.id, targetUserId]);

  useEffect(() => {
    if (!isOpen || !currentUser?.id || !selectedUser) return;
    let cancelled = false;
    setMessages([]);
    const fetchMessages = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages/${currentUser.id}/${selectedUser.id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setMessages(Array.isArray(data) ? data : []);
      } catch (err) { console.error("Errore messaggi", err); }
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [isOpen, currentUser?.id, selectedUser?.id]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !currentUser?.id) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newMessage, senderId: currentUser.id, receiverId: selectedUser.id })
      });
      if (res.ok) {
        const sentMsg = await res.json();
        setMessages(prev => prev.some(m => m.id === sentMsg.id) ? prev : [...prev, sentMsg]);
        setNewMessage(""); 
      }
    } catch (err) { console.error("Errore invio", err); }
  };

  if (!currentUser) return null;

  return (
    <>
      {/* Overlay - Z-index altissimo, blocca la home sotto */}
      <div 
        className={`fixed inset-0 z-[9998] bg-black/80 backdrop-blur-md transition-opacity duration-500 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`} 
        onClick={onClose}
      ></div>

      {/* Pannello Sidebar - Opaco e sopra a tutto */}
      <div 
        className={`fixed top-0 right-0 z-[9999] w-full max-w-md bg-slate-950 border-l border-cyan-500/40 shadow-[-25px_0_60px_rgba(0,0,0,0.9)] flex flex-col h-full transform transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        
        {/* Header - Design originale ma più solido */}
        <div className="p-4 border-b border-cyan-900/50 bg-slate-900 flex justify-between items-center relative">
          <div className="relative z-10">
            <h2 className="text-cyan-400 font-black tracking-widest text-xl">NET_MESSENGER</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
              <p className="text-[9px] text-cyan-500/80 uppercase font-bold tracking-widest">Connessione Protetta</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 flex items-center justify-center bg-slate-800 border border-slate-700 text-cyan-500 hover:bg-cyan-500 hover:text-slate-950 transition-all duration-300 cursor-pointer rounded-sm"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Contatti - Stile Originale */}
          <div className="w-[80px] sm:w-[100px] border-r border-slate-800 bg-slate-900/50 overflow-y-auto">
            {users.map(u => (
              <div 
                key={u.id} 
                onClick={() => setSelectedUser(u)}
                className={`p-3 cursor-pointer border-b border-slate-800 flex flex-col items-center gap-2 transition-all ${
                  selectedUser?.id === u.id ? 'bg-cyan-900/30 border-l-4 border-l-cyan-500' : 'hover:bg-slate-800/40 grayscale hover:grayscale-0'
                }`}
              >
                <div className="relative">
                  {u.avatar ? (
                    <img src={u.avatar} className={`w-10 h-10 object-cover rounded ${selectedUser?.id === u.id ? 'ring-2 ring-cyan-500' : 'ring-1 ring-slate-700'}`} alt="avatar" />
                  ) : (
                    <div className="w-10 h-10 flex items-center justify-center bg-slate-800 rounded text-xl">👤</div>
                  )}
                </div>
                <span className="text-[8px] font-bold uppercase truncate w-full text-center text-slate-400">{u.username}</span>
              </div>
            ))}
          </div>

          {/* Area Messaggi - Solida e scura */}
          <div className="flex-1 flex flex-col bg-slate-950 relative">
            {selectedUser ? (
              <div className="flex flex-col h-full">
                <div className="p-3 bg-slate-900/40 border-b border-slate-800 text-[10px] text-cyan-400 font-bold uppercase">
                  NODE: {selectedUser.username}
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-3 text-xs rounded-lg ${
                        msg.senderId === currentUser.id 
                          ? 'bg-cyan-700 text-white rounded-tr-none' 
                          : 'bg-slate-800 text-slate-200 rounded-tl-none'
                      }`}>
                        <p className="break-words">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={sendMessage} className="p-4 border-t border-slate-800 bg-slate-900">
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Scrivi..."
                      className="flex-1 bg-black border border-slate-700 rounded px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none"
                    />
                    <button type="submit" className="bg-cyan-500 text-black px-4 py-2 rounded font-bold text-[10px] hover:bg-cyan-400">SEND</button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-slate-800 text-[10px] uppercase font-bold tracking-[0.3em]">Select a contact</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
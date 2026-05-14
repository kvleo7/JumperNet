"use client";

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { User } from '../../types';

interface Message {
  id: number;
  text: string;
  senderId: number;
  receiverId: number;
  createdAt: string;
}

function ChatContent() {

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const searchParams = useSearchParams();
  const targetIdFromUrl = searchParams.get('target');

  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('jumper_user');

    if (user && user !== "undefined") {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  useEffect(() => {
    if (currentUser?.id) {

      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`)
        .then(res => res.json())
        .then(data => {

          const validData = Array.isArray(data) ? data : [];

          const otherUsers = validData.filter(
            (u: User) => u.id !== currentUser.id
          );

          setUsers(otherUsers);

          if (targetIdFromUrl) {

            const target = otherUsers.find(
              (u: User) => u.id === Number(targetIdFromUrl)
            );

            if (target) setSelectedUser(target);
          }
        })
        .catch(err => {
          console.error("Errore contatti:", err);
          setUsers([]);
        });
    }
  }, [currentUser, targetIdFromUrl]);

  useEffect(() => {

    if (!currentUser?.id || !selectedUser) return;

    const fetchMessages = async () => {

      try {

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/messages/${currentUser.id}/${selectedUser.id}`
        );

        const data = await res.json();

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

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },

          body: JSON.stringify({
            text: newMessage,
            senderId: currentUser.id,
            receiverId: selectedUser.id
          })
        }
      );

      if (res.ok) {

        const msg = await res.json();

        setMessages([...messages, msg]);

        setNewMessage("");
      }

    } catch (err) {
      console.error(err);
    }
  };

  if (!currentUser) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center text-cyan-500">
        Connessione terminale in corso...
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-slate-950 flex overflow-hidden font-sans text-slate-200">

      <div className="w-1/4 max-w-[350px] border-r border-cyan-900/30 bg-slate-900/50 flex flex-col">

        <div className="p-6 border-b border-cyan-900/30">

          <button
            onClick={() => router.push('/feed')}
            className="flex items-center gap-2 text-[10px] text-cyan-500/70 hover:text-cyan-400 uppercase tracking-widest font-bold mb-4 transition-all"
          >
            <span>◀</span> RETE_PRINCIPALE
          </button>

          <h1 className="text-cyan-400 font-black tracking-tighter text-2xl">
            NET_MESSENGER
          </h1>

        </div>

        <div className="flex-1 overflow-y-auto">

          {users.map(u => (

            <div
              key={u.id}
              onClick={() => setSelectedUser(u)}
              className={`flex items-center gap-4 p-4 cursor-pointer border-b border-slate-800/50 ${
                selectedUser?.id === u.id
                  ? 'bg-cyan-950/40'
                  : 'hover:bg-slate-800/30'
              }`}
            >

              <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden">
                {u.avatar
                  ? <img src={u.avatar} className="w-full h-full object-cover" />
                  : "👤"}
              </div>

              <p>{u.username}</p>

            </div>
          ))}

        </div>

      </div>

      <div className="flex-1 flex flex-col">

        {selectedUser ? (

          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">

              {messages.map((m, i) => (

                <div
                  key={i}
                  className={`flex ${
                    m.senderId === currentUser.id
                      ? 'justify-end'
                      : 'justify-start'
                  }`}
                >

                  <div className="bg-slate-800 p-3 rounded-xl">
                    {m.text}
                  </div>

                </div>
              ))}

            </div>

            <form
              onSubmit={sendMessage}
              className="p-4 flex gap-2"
            >

              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 bg-black border border-slate-700 rounded-xl px-4 py-3"
              />

              <button
                type="submit"
                className="bg-cyan-500 text-black px-6 rounded-xl"
              >
                Send
              </button>

            </form>
          </>

        ) : (

          <div className="flex-1 flex items-center justify-center">
            Seleziona un utente
          </div>

        )}

      </div>

    </div>
  );
}

export default function ChatPage() {

  return (
    <Suspense
      fallback={
        <div className="h-screen bg-slate-950 flex items-center justify-center text-cyan-500">
          Loading chat...
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
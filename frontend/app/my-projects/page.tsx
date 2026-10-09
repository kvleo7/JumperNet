"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MyProjectsPage() {
  const [user, setUser] = useState<any>(null);
  const [myProjects, setMyProjects] = useState<any[]>([]);
  const router = useRouter();

  // Stato per la modale di modifica
  const [editingPost, setEditingPost] = useState<any>(null);

  useEffect(() => {
    const u = localStorage.getItem('jumper_user');
    if (u && u !== "undefined") { 
      const parsedUser = JSON.parse(u);
      setUser(parsedUser);
      // Recupera tutti i progetti e filtra quelli dell'utente
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects`)
        .then(r => r.json())
        .then(data => {
          // Filtra usando user.id o authorId
          const filtered = data.filter((p: any) => p.userId == parsedUser.id || p.authorId == parsedUser.id);
          setMyProjects(filtered);
        });
    } else {
      router.push('/login');
    }
  }, [router]);

  // ELIMINA PROGETTO
  const handleDelete = async (id: number) => {
    if (!confirm("⚠️ ATTENZIONE: Sei sicuro di voler eliminare definitivamente questo progetto? L'azione è irreversibile.")) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setMyProjects(myProjects.filter(p => p.id !== id));
        alert("✅ Progetto eliminato con successo.");
      } else {
        alert("❌ Errore dal server. Hai implementato la rotta DELETE /api/projects/:id ?");
      }
    } catch (err) {
      alert("❌ Impossibile comunicare col server.");
    }
  };

  // SALVA MODIFICHE (EDIT)
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPost) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${editingPost.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingPost.title,
          description: editingPost.description,
          mediaUrl: editingPost.mediaUrl,
          mediaType: editingPost.mediaType
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setMyProjects(myProjects.map(p => p.id === updated.id ? updated : p));
        setEditingPost(null);
        alert("✅ Protocollo aggiornato.");
      } else {
        alert("❌ Il server ha rifiutato l'aggiornamento. Manca la rotta PUT /api/projects/:id?");
      }
    } catch (err) {
      alert("❌ Errore di rete.");
    }
  };

  if (!user) return <div className="min-h-screen bg-slate-950 text-cyan-500 font-mono p-10">INIZIALIZZAZIONE...</div>;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-10 font-mono relative">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex justify-between items-center border-b border-cyan-500/20 pb-4">
          <div>
            <h1 className="text-3xl font-black text-cyan-400 uppercase tracking-tighter">I_Miei_Progetti.exe</h1>
            <p className="text-xs text-slate-500 mt-1">Gestione Dati Locali - Utente: {user.username}</p>
          </div>
          {/* MODIFICA QUI: href punta a /feed */}
          <Link href="/feed" className="px-6 py-2 border border-slate-700 text-slate-400 rounded hover:bg-slate-800 hover:text-white uppercase text-xs font-bold transition-all">
            Torna alla Home
          </Link>
        </div>

        {/* LISTA PROGETTI */}
        {myProjects.length === 0 ? (
          <div className="text-center p-20 border border-dashed border-slate-800 rounded-xl text-slate-500 uppercase tracking-widest text-sm">
            Nessun progetto trovato nel database.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {myProjects.map(p => (
              <div key={p.id} className="bg-slate-900 border border-slate-800 p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-cyan-500/30 transition-colors">
                
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white">{p.title}</h2>
                  <p className="text-sm text-slate-400 mt-2 line-clamp-2">{p.description}</p>
                  <p className="text-[10px] text-cyan-600 mt-3 uppercase tracking-widest">
                    LIKE: {p.likesCount || 0} | TIPO_MEDIA: {p.mediaType}
                  </p>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                  <button 
                    onClick={() => setEditingPost(p)}
                    className="flex-1 md:flex-none px-4 py-2 bg-blue-900/30 border border-blue-500/50 text-blue-400 rounded text-xs uppercase font-bold hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    Modifica
                  </button>
                  <button 
                    onClick={() => handleDelete(p.id)}
                    className="flex-1 md:flex-none px-4 py-2 bg-red-900/30 border border-red-500/50 text-red-400 rounded text-xs uppercase font-bold hover:bg-red-600 hover:text-white transition-colors"
                  >
                    Elimina
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODALE DI MODIFICA */}
      {editingPost && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 w-full max-w-lg p-8 rounded-2xl border border-cyan-500/40 shadow-2xl">
            <h2 className="text-cyan-400 font-bold mb-6 uppercase tracking-widest">Riscrivi Protocollo</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <input 
                required className="w-full p-4 bg-slate-950 border border-slate-800 rounded outline-none focus:border-cyan-500" 
                value={editingPost.title} onChange={e => setEditingPost({...editingPost, title: e.target.value})} 
              />
              <textarea 
                required className="w-full p-4 bg-slate-950 border border-slate-800 rounded h-32 outline-none focus:border-cyan-500" 
                value={editingPost.description} onChange={e => setEditingPost({...editingPost, description: e.target.value})} 
              />
              <div className="grid grid-cols-2 gap-2">
                <select 
                  className="bg-slate-950 border border-slate-800 p-2 text-xs text-cyan-500 outline-none focus:border-cyan-500 rounded" 
                  value={editingPost.mediaType} onChange={e => setEditingPost({...editingPost, mediaType: e.target.value})}
                >
                  <option value="text">SOLO TESTO</option><option value="image">IMMAGINE</option><option value="video">VIDEO</option><option value="code">CODICE</option><option value="link">LINK</option>
                </select>
                <input 
                  className="bg-slate-950 border border-slate-800 p-2 text-xs text-white outline-none focus:border-cyan-500 rounded" 
                  value={editingPost.mediaUrl || ''} onChange={e => setEditingPost({...editingPost, mediaUrl: e.target.value})} 
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setEditingPost(null)} className="flex-1 p-3 border border-slate-700 text-slate-500 hover:bg-slate-800 hover:text-white transition-all uppercase text-xs rounded font-bold tracking-wider">Annulla</button>
                <button type="submit" className="flex-1 p-3 bg-cyan-600 text-slate-950 hover:bg-cyan-500 transition-all font-bold uppercase text-xs rounded tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.3)]">Salva Modifiche</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
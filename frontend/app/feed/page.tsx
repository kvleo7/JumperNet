// frontend/app/feed/page.tsx
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import PostCard from '../../components/PostCard';
import { User, Project, NewPost, Comment } from '../../types';

export default function Feed() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [user, setUser] = useState<User | null>(null);
  
  // Modals & Menu
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  // STATO DELLA CHAT RIMOSSO: Ora andiamo su una pagina dedicata
  
  // Filtri & Ricerca
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>(['tutti']);
  
  // Gestione Post
  const [newPost, setNewPost] = useState<NewPost>({ 
    title: '', description: '', mediaUrl: '', mediaType: 'text'
  });
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');

  // Sistema
  const [lang, setLang] = useState('it');
  const [powerSaving, setPowerSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const initializeData = async () => {
      try {
        const u = localStorage.getItem('jumper_user');
        if (u && u !== "undefined") { 
          const parsedUser = JSON.parse(u);
          setUser(parsedUser); 
          
          // SCARICA SIA I PROGETTI CHE GLI UTENTI IN PARALLELO
          const [projRes, usersRes] = await Promise.all([
            fetch('${process.env.NEXT_PUBLIC_API_URL}/api/projects'),
            fetch('${process.env.NEXT_PUBLIC_API_URL}/api/users')
          ]);

          if (projRes.ok && usersRes.ok) {
            const allProjects = await projRes.json();
            const allUsers = await usersRes.json();

            // UNISCI I DATI: Aggiungi l'autore corretto ad ogni progetto
            const projectsWithAuthors = allProjects.map((p: any) => {
              const targetId = Number(p.authorId || p.userId || p.user_id || p.author_id);
              const foundUser = allUsers.find((u: any) => Number(u.id) === targetId);
              return { ...p, author: foundUser || null };
            });

            setProjects(projectsWithAuthors);
          }
        } else {
          router.push('/');
          return; 
        }
      } catch (e) {
        console.error("Errore nel caricamento dei dati:", e);
        router.push('/');
        return;
      }
    };

    initializeData();
    
    const savedLang = localStorage.getItem('sys_lang');
    if (savedLang) setLang(savedLang);
    const savedPower = localStorage.getItem('sys_power_saving');
    if (savedPower === 'true') setPowerSaving(true);
  }, [router]);

  // FUNZIONE PER MULTI-SELEZIONE FILTRI
  const toggleFilter = (filterId: string) => {
    if (filterId === 'tutti') {
      setActiveFilters(['tutti']);
      return;
    }
    
    let newFilters = activeFilters.filter(f => f !== 'tutti');
    
    if (newFilters.includes(filterId)) {
      newFilters = newFilters.filter(f => f !== filterId);
    } else {
      newFilters.push(filterId);
    }
    
    if (newFilters.length === 0) {
      setActiveFilters(['tutti']);
    } else {
      setActiveFilters(newFilters);
    }
  };

  const filteredProjects = projects.filter(p => {
    if (!activeFilters.includes('tutti') && p.mediaType && !activeFilters.includes(p.mediaType)) return false;
    
    const termine = searchTerm.toLowerCase().trim();
    if (!termine) return true;

    if (termine.startsWith('@')) {
      const usernameCercato = termine.slice(1); 
      if (!usernameCercato) return true; 
      const matchAutore = (p.author?.username || '').toLowerCase().includes(usernameCercato);
      const matchCommentatore = p.comments?.some(c => (c.author?.username || '').toLowerCase().includes(usernameCercato)) || false;
      return matchAutore || matchCommentatore;
    }

    const matchTitolo = (p.title || '').toLowerCase().includes(termine);
    const matchDescrizione = (p.description || '').toLowerCase().includes(termine);
    return matchTitolo || matchDescrizione;
  });

  const cambiaLingua = (codiceLingua: string) => {
    setLang(codiceLingua);
    localStorage.setItem('sys_lang', codiceLingua);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("⚠️ Rifiutato: Il file supera il limite massimo di 10MB consentito dal server.");
        e.target.value = ''; 
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => { setNewPost({ ...newPost, mediaUrl: reader.result as string }); };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("Devi effettuare il login per postare.");
    try {
      const res = await fetch('${process.env.NEXT_PUBLIC_API_URL}/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newPost, userId: user.id })
      });
      if (res.ok) {
        const p: Project = await res.json();
        // ASSEGNA L'AUTORE CORRENTE AL NUOVO POST
        p.author = user; 
        setProjects([p, ...projects]);
        setIsModalOpen(false);
        setNewPost({ title: '', description: '', mediaUrl: '', mediaType: 'text' });
        setUploadMethod('url');
      } else { alert("❌ Errore server."); }
    } catch(err) { alert("❌ Errore connessione."); }
  };

  const handleUpvote = async (projectId: number) => {
    if (!user) return alert("ERRORE: Devi autenticarti per mettere Like.");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}/like`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(projects.map(p => p.id === projectId ? { ...p, likesCount: data.likesCount } : p));
      } else { alert("❌ Errore Like."); }
    } catch(err) { alert("❌ Errore rete."); }
  };

  const handleComment = async (e: React.FormEvent, projectId: number, text: string) => {
    if (e) e.preventDefault(); 
    
    if (!user) return alert("ERRORE: Devi autenticarti per commentare.");
    if (!text.trim()) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text, userId: user.id })
      });

      if (res.ok) {
        const newComment: Comment = await res.json();
        if (!newComment.author) newComment.author = { username: user.username, id: user.id };
        setProjects(projects.map(p => p.id === projectId ? { ...p, comments: [...(p.comments || []), newComment] } : p));
      } else { alert("❌ Errore server."); }
    } catch (err) { alert("❌ Errore connessione."); }
  };

  const handleDeleteComment = async (commentId: number, projectId: number) => {
    if (!confirm("Sei sicuro di voler eliminare questo commento?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comments/${commentId}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects(projects.map(p => p.id === projectId ? { ...p, comments: (p.comments || []).filter(c => c.id !== commentId) } : p));
      } else { alert("❌ Errore eliminazione."); }
    } catch (err) { alert("❌ Errore connessione."); }
  };

  if (!user) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-cyan-500 font-mono tracking-widest uppercase">VERIFICA_CREDENZIALI_IN_CORSO...</div>;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 pb-10 relative font-mono">
      {!powerSaving && <div className="fixed inset-0 bg-[linear-gradient(rgba(30,58,138,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(30,58,138,0.1)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none z-0"></div>}

      <Navbar 
        user={user}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setIsModalOpen={setIsModalOpen}
        setIsSettingsOpen={setIsSettingsOpen}
        /* TRUCCO MAGICO: Invece di aprire la sidebar, reindirizziamo alla pagina /chat */
        setIsChatOpen={() => router.push('/chat')} 
      />

      {/* SEZIONE FILTRI STILE GEMINI */}
      <div className="max-w-2xl mx-auto mt-6 px-4 flex flex-col items-center relative z-40">
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full border text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow-lg
            ${showFilters || !activeFilters.includes('tutti') 
              ? 'bg-cyan-900/30 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
              : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'}`}
        >
          <span>⚙️ FILTRI DI RICERCA</span>
          {!activeFilters.includes('tutti') && (
            <span className="bg-cyan-500 text-slate-950 px-2 py-0.5 rounded-full text-[10px]">
              {activeFilters.length}
            </span>
          )}
        </button>

        {showFilters && (
          <div className="absolute top-14 bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-2xl p-4 shadow-2xl shadow-black flex flex-wrap gap-2 w-full max-w-md justify-center animate-in fade-in slide-in-from-top-2">
            <button
              onClick={() => toggleFilter('tutti')}
              className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${
                activeFilters.includes('tutti') 
                  ? 'bg-cyan-500 text-slate-950 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.4)]' 
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              🌟 TUTTI
            </button>
            <div className="w-full h-px bg-slate-800/50 my-1"></div>
            {[
              { id: 'image', label: 'IMMAGINI', icon: '🖼️' },
              { id: 'video', label: 'VIDEO', icon: '🎥' },
              { id: 'code', label: 'CODICE', icon: '💻' },
              { id: 'link', label: 'LINK', icon: '🔗' },
              { id: 'text', label: 'TESTO', icon: '📄' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => toggleFilter(f.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${
                  activeFilters.includes(f.id)
                    ? 'bg-cyan-900/50 text-cyan-400 border-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <span className="mr-1">{f.icon}</span> {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-2xl mx-auto mt-8 px-4 space-y-10 relative z-10">
        {filteredProjects.length > 0 ? (
          filteredProjects.map(p => (
            <PostCard 
              key={p.id} 
              p={p} 
              user={user} 
              handleUpvote={handleUpvote} 
              handleComment={handleComment} 
              handleDeleteComment={handleDeleteComment} 
            />
          ))
        ) : (
          <div className="text-center py-20 border border-dashed border-slate-800 rounded-xl">
             <p className="text-slate-600 uppercase tracking-widest font-bold">Nessun dato corrispondente alla ricerca.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
         <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
         <div className="bg-slate-900 w-full max-w-lg p-8 rounded-2xl border border-cyan-500/40 shadow-2xl max-h-[90vh] overflow-y-auto">
           <h2 className="text-cyan-400 font-bold mb-6 uppercase tracking-widest">Nuovo Trasferimento_Dati</h2>
           <form onSubmit={handleCreate} className="space-y-4">
             <input placeholder="TITOLO_POST" required className="w-full p-4 bg-slate-950 border border-slate-800 rounded outline-none focus:border-cyan-500" value={newPost.title ?? ''} onChange={e => setNewPost({...newPost, title: e.target.value})} />
             <textarea placeholder="CONTENUTO_TESTUALE (Descrizione)..." required className="w-full p-4 bg-slate-950 border border-slate-800 rounded h-24 outline-none focus:border-cyan-500" value={newPost.description ?? ''} onChange={e => setNewPost({...newPost, description: e.target.value})} />
             
             <div className="flex flex-col gap-3">
               <select 
                 className="w-full bg-slate-950 border border-slate-800 p-3 text-xs text-cyan-500 font-bold uppercase tracking-widest outline-none focus:border-cyan-500 rounded" 
                 value={newPost.mediaType} 
                 onChange={e => setNewPost({...newPost, mediaType: e.target.value, mediaUrl: ''})}
               >
                 <option value="text">SOLO TESTO</option>
                 <option value="image">IMMAGINE</option>
                 <option value="video">VIDEO</option>
                 <option value="code">SNIPPET CODICE</option>
                 <option value="link">LINK ESTERNO</option>
               </select>

               {newPost.mediaType === 'code' && (
                 <textarea placeholder="// INCOLLA QUI IL TUO CODICE SORGENTE..." className="w-full bg-[#0d1117] border border-cyan-500/50 p-4 text-xs text-cyan-300 font-mono outline-none focus:border-cyan-400 rounded-xl h-40 shadow-[inset_0_0_15px_rgba(6,182,212,0.1)] whitespace-pre" value={newPost.mediaUrl ?? ''} onChange={e => setNewPost({...newPost, mediaUrl: e.target.value})} />
               )}

               {newPost.mediaType === 'link' && (
                 <input placeholder="INSERISCI URL ESTERNO (https://...)" className="w-full bg-slate-950 border border-slate-800 p-3 text-xs text-white outline-none focus:border-cyan-500 rounded" value={newPost.mediaUrl ?? ''} onChange={e => setNewPost({...newPost, mediaUrl: e.target.value})} />
               )}
               
               {(newPost.mediaType === 'image' || newPost.mediaType === 'video') && (
                 <div className="space-y-3 bg-slate-950/50 border border-slate-800 p-4 rounded-xl">
                    <div className="flex gap-4 border-b border-slate-800 pb-3">
                      <label className="flex items-center gap-2 text-[10px] uppercase font-bold text-cyan-500 cursor-pointer hover:text-cyan-300 transition-colors">
                        <input type="radio" name="upload" value="url" checked={uploadMethod === 'url'} onChange={() => { setUploadMethod('url'); setNewPost({...newPost, mediaUrl: ''}); }} className="accent-cyan-500" />
                        Incolla Link (URL)
                      </label>
                      <label className="flex items-center gap-2 text-[10px] uppercase font-bold text-cyan-500 cursor-pointer hover:text-cyan-300 transition-colors">
                        <input type="radio" name="upload" value="file" checked={uploadMethod === 'file'} onChange={() => { setUploadMethod('file'); setNewPost({...newPost, mediaUrl: ''}); }} className="accent-cyan-500" />
                        Dal PC Locale
                      </label>
                    </div>

                    {uploadMethod === 'url' ? (
                      <input placeholder="INSERISCI URL SORGENTE (https://...)" className="w-full bg-slate-950 border border-slate-800 p-3 text-xs text-white outline-none focus:border-cyan-500 rounded" value={newPost.mediaUrl ?? ''} onChange={e => setNewPost({...newPost, mediaUrl: e.target.value})} />
                    ) : (
                      <input type="file" accept={newPost.mediaType === 'image' ? 'image/*' : 'video/*'} onChange={handleFileChange} className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:bg-cyan-900/30 file:text-cyan-400 hover:file:bg-cyan-900/50 cursor-pointer" />
                    )}
                 </div>
               )}
             </div>

             <div className="flex gap-4 pt-4">
               <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 p-3 border border-slate-700 text-slate-500 hover:bg-slate-800 hover:text-white transition-all uppercase text-xs rounded font-bold tracking-wider">Annulla</button>
               <button type="submit" className="flex-1 p-3 bg-cyan-600 text-slate-950 hover:bg-cyan-500 transition-all font-bold uppercase text-xs rounded tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.3)]">Trasmetti</button>
             </div>
           </form>
         </div>
       </div>
      )}

      {isSettingsOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="bg-slate-900 w-full max-w-sm p-8 rounded-2xl border border-cyan-500/40 shadow-2xl">
          <h2 className="text-cyan-400 font-bold mb-6 uppercase tracking-widest border-b border-slate-800 pb-2">SYS_CONFIG</h2>
          <div className="space-y-6">
            <div>
              <label className="text-xs text-slate-400 uppercase block mb-2">Protocollo_Linguistico</label>
              <select value={lang} onChange={(e) => cambiaLingua(e.target.value)} className="w-full bg-slate-950 border border-slate-800 p-3 text-cyan-500 outline-none focus:border-cyan-500 rounded">
                <option value="it">Italiano (IT) - Lingua Madre</option><option value="en">English (EN)</option><option value="es">Español (ES)</option>
              </select>
            </div>
            <div className="flex items-center justify-between bg-slate-950/50 p-3 border border-slate-800 rounded">
              <span className="text-xs text-slate-400 uppercase">Risparmio_Energetico</span>
              <button onClick={() => { setPowerSaving(!powerSaving); localStorage.setItem('sys_power_saving', (!powerSaving).toString()); }} className={`w-12 h-6 rounded-full relative transition-colors ${powerSaving ? 'bg-cyan-500' : 'bg-slate-800'}`}>
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${powerSaving ? 'left-7 shadow-[0_0_10px_white]' : 'left-1'}`}></div>
              </button>
            </div>
            <button 
              onClick={() => { localStorage.removeItem('jumper_user'); router.push('/'); }} 
              className="w-full mt-4 p-3 bg-red-500/10 border border-red-500/50 text-red-400 rounded hover:bg-red-500 hover:text-white transition-all uppercase text-xs font-bold tracking-widest"
            >
              [ Disconnetti_Terminale ]
            </button>
          </div>
          <button onClick={() => setIsSettingsOpen(false)} className="w-full mt-8 p-3 border border-slate-700 text-slate-400 rounded hover:bg-slate-800 hover:text-white transition-colors uppercase text-xs">Chiudi_Pannello</button>
        </div>
      </div>
      )}
    </main>
  );
}
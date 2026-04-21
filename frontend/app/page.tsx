"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';

const scanContent = (text: string, link: string) => {
  const isUnsafe = text.includes('<script>') || (link && !link.startsWith('https://') && link !== '');
  if (isUnsafe) {
    return { status: 'CRITICAL', color: 'text-red-400', border: 'border-red-500/50', msg: '⚠️ MINACCIA: Link non sicuro o script rilevato' };
  }
  return { status: 'SAFE', color: 'text-green-400', border: 'border-green-500/50', msg: '✅ INTEGRITÀ CONFERMATA' };
};

export default function Home() {
  const [projects, setProjects] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [newPost, setNewPost] = useState({ 
    title: '', description: '', mediaUrl: '', mediaType: 'text'
  });

  const [lang, setLang] = useState('it');
  const [powerSaving, setPowerSaving] = useState(false);
  const [activeCommentPost, setActiveCommentPost] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    fetch('http://localhost:3001/api/projects').then(r => r.json()).then(setProjects).catch(e => console.error("Errore fetch progetti", e));
    
    const u = localStorage.getItem('jumper_user');
    if (u && u !== "undefined") { setUser(JSON.parse(u)); }
    
    const savedLang = localStorage.getItem('sys_lang');
    if (savedLang) setLang(savedLang);
    const savedPower = localStorage.getItem('sys_power_saving');
    if (savedPower === 'true') setPowerSaving(true);

    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);

      (window as any).googleTranslateElementInit = () => {
        new (window as any).google.translate.TranslateElement(
          { pageLanguage: 'it', autoDisplay: false },
          'google_translate_element'
        );
      };
    }
  }, []);

  const cambiaLingua = (codiceLingua: string) => {
    setLang(codiceLingua);
    localStorage.setItem('sys_lang', codiceLingua);
    document.cookie = `googtrans=/it/${codiceLingua}; path=/`;
    document.cookie = `googtrans=/it/${codiceLingua}; path=/; domain=${window.location.hostname}`;
    window.location.reload();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("Devi effettuare il login per postare.");
    
    try {
      const res = await fetch('http://localhost:3001/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newPost, userId: user.id })
      });
      if (res.ok) {
        const p = await res.json();
        setProjects([p, ...projects]);
        setIsModalOpen(false);
        setNewPost({ title: '', description: '', mediaUrl: '', mediaType: 'text' });
      } else {
        alert("❌ Errore del server durante la creazione del post.");
      }
    } catch(err) {
      alert("❌ Impossibile connettersi al server.");
    }
  };

  const handleUpvote = async (projectId: number) => {
    if (!user) return alert("ERRORE: Devi autenticarti per mettere Like.");
    
    try {
      const res = await fetch(`http://localhost:3001/api/projects/${projectId}/like`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      
      if (res.ok) {
        const data = await res.json();
        setProjects(projects.map(p => p.id === projectId ? { ...p, likesCount: data.likesCount } : p));
      } else {
        console.error("Errore Like:", await res.text());
        alert("❌ Il backend non ha processato il Like. Controlla le rotte server.");
      }
    } catch(err) {
      alert("❌ Errore di rete sul Like.");
    }
  };

  const handleComment = async (e: React.FormEvent, projectId: number) => {
    e.preventDefault();
    if (!user) return alert("ERRORE: Devi autenticarti per commentare.");
    if (!commentText.trim()) return;

    try {
      const res = await fetch(`http://localhost:3001/api/projects/${projectId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: commentText, userId: user.id })
      });

      if (res.ok) {
        const newComment = await res.json();
        if (!newComment.author) newComment.author = { username: user.username };
        setProjects(projects.map(p => p.id === projectId ? { ...p, comments: [...(p.comments || []), newComment] } : p));
        setCommentText("");
      } else {
        alert("❌ Errore nell'invio del commento al server.");
      }
    } catch (err) {
      alert("❌ Errore di connessione.");
    }
  };

  const handleDeleteComment = async (commentId: number, projectId: number) => {
    if (!confirm("Sei sicuro di voler eliminare questo commento?")) return;
    
    try {
      const res = await fetch(`http://localhost:3001/api/comments/${commentId}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects(projects.map(p => p.id === projectId ? { ...p, comments: p.comments.filter((c: any) => c.id !== commentId) } : p));
      } else {
        alert("❌ Il server ha rifiutato l'eliminazione. La rotta DELETE /api/comments/:id esiste sul backend?");
      }
    } catch (err) {
      alert("❌ Errore di connessione al server.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 pb-10 relative font-mono">
      <style dangerouslySetInnerHTML={{
        __html: `
          #google_translate_element { display: none !important; }
          .skiptranslate iframe { display: none !important; }
          body { top: 0 !important; }
          #goog-gt-tt, .goog-te-balloon-frame { display: none !important; }
          .goog-text-highlight { background-color: transparent !important; box-shadow: none !important; }
        `
      }} />
      <div id="google_translate_element"></div>
      {!powerSaving && <div className="fixed inset-0 bg-[linear-gradient(rgba(30,58,138,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(30,58,138,0.1)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none z-0"></div>}

      {/* HEADER AGGIORNATO CON NUOVI PULSANTI */}
      <header className="bg-slate-900/80 border-b border-cyan-500/20 p-4 flex justify-between items-center sticky top-0 z-40 backdrop-blur-xl">
        <h1 className="font-black text-cyan-400 text-2xl tracking-tighter">JUMPER_NET v2.1</h1>
        <div className="flex gap-4 items-center">
          {user ? (
            <>
              {/* ✨ NUOVO PULSANTE: I MIEI PROGETTI */}
              <Link href="/my-projects" className="bg-slate-800 border border-slate-600 text-slate-300 px-4 py-2 rounded font-bold text-[10px] uppercase hover:bg-cyan-900/50 hover:text-cyan-400 hover:border-cyan-500 transition-all shadow-lg">
                📁 I Miei Progetti
              </Link>

              <button onClick={() => setIsModalOpen(true)} className="bg-cyan-500 text-slate-950 px-4 py-2 rounded font-bold text-xs uppercase hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all">
                + NUOVO_POST
              </button>
              
              <Link href="/profile" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-widest text-xs font-bold border-l border-slate-700 pl-4 ml-2">
                {user.avatar ? (
                  <img src={user.avatar} className="w-8 h-8 rounded-full border border-cyan-500/50 object-cover" alt="avatar" />
                ) : (
                  <span className="text-xl">👤</span>
                )}
                <span className="hidden sm:inline">{user.username}</span>
              </Link>

              <button onClick={() => setIsSettingsOpen(true)} className="text-cyan-500 text-xl hover:scale-110 transition-transform ml-2">
                ⚙️
              </button>
            </>
          ) : (
            <Link href="/login" className="text-cyan-500 border border-cyan-500/30 px-4 py-2 rounded text-xs uppercase hover:bg-cyan-500/10 transition-colors">Accedi</Link>
          )}
        </div>
      </header>

      {/* LISTA PROGETTI (Invariata ma con logica rinforzata) */}
      <div className="max-w-2xl mx-auto mt-10 px-4 space-y-10 relative z-10">
        {projects.map(p => {
          const security = scanContent(p.description, p.mediaUrl);
          return (
            <div key={p.id} className={`bg-slate-900/60 rounded-xl border ${security.border} overflow-hidden transition-all hover:shadow-[0_0_30px_rgba(6,182,212,0.1)]`}>
              <div className="p-4 bg-slate-950/50 flex justify-between items-center border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-cyan-500/10 border border-cyan-500/50 flex items-center justify-center text-cyan-400 font-bold">
                    {p.author?.username?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="text-sm text-cyan-300 font-bold">@{p.author?.username || 'Sconosciuto'}</p>
                    <p className={`text-[9px] uppercase font-bold ${security.color}`}>{security.msg}</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-3">{p.title}</h2>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed whitespace-pre-wrap">{p.description}</p>
                {p.mediaUrl && (
                  <div className="rounded-lg overflow-hidden border border-slate-800 bg-black/40 flex justify-center">
                    {p.mediaType === 'image' && <img src={p.mediaUrl} className="w-full h-auto max-h-[500px] object-contain bg-black" alt="Media" />}
                    {p.mediaType === 'video' && <video src={p.mediaUrl} controls className="w-full max-h-[500px] bg-black" />}
                    {p.mediaType === 'code' && <pre className="p-4 w-full text-xs text-green-400 overflow-x-auto"><code>{p.mediaUrl}</code></pre>}
                    {p.mediaType === 'link' && <a href={p.mediaUrl} target="_blank" rel="noreferrer" className="block p-4 text-cyan-400 hover:underline w-full truncate text-center">🔗 ACCEDI AL LINK ESTERNO</a>}
                  </div>
                )}
              </div>

              <div className="px-6 py-3 bg-slate-950/30 border-t border-slate-800 flex flex-col gap-4">
                <div className="flex gap-6 text-[10px] font-bold text-slate-500 uppercase items-center">
                  <button onClick={() => handleUpvote(p.id)} className="hover:text-cyan-400 transition-colors flex items-center gap-1 cursor-pointer">
                    <span className="text-sm">▲</span> UPVOTE [{p.likesCount || 0}]
                  </button>
                  <button onClick={() => setActiveCommentPost(activeCommentPost === p.id ? null : p.id)} className="hover:text-cyan-400 transition-colors flex items-center gap-1 cursor-pointer">
                    <span className="text-sm">💬</span> COMMENTI [{(p.comments && p.comments.length) || 0}]
                  </button>
                </div>

                {activeCommentPost === p.id && (
                  <div className="mt-2 space-y-3 border-t border-slate-800/50 pt-3 animate-in fade-in duration-300">
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                      {p.comments && p.comments.length > 0 ? (
                        p.comments.map((c: any) => (
                          <div key={c.id} className="group flex justify-between items-center text-xs text-slate-300 bg-slate-950 p-2 rounded border border-slate-800/50">
                            <div>
                              <span className="text-cyan-500 font-bold tracking-wider">@{c.author?.username}</span><span className="text-slate-500">:</span> {c.text}
                            </div>
                            
                            {/* Controllo modificato per i tipi di ID */}
                            {user && (user.id == c.userId) && (
                              <button 
                                onClick={() => handleDeleteComment(c.id, p.id)}
                                className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 transition-all text-[10px] uppercase font-bold cursor-pointer"
                              >
                                [ELIMINA]
                              </button>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-[10px] text-slate-600 uppercase tracking-widest text-center py-2">Nessun log trovato.</p>
                      )}
                    </div>
                    <form onSubmit={(e) => handleComment(e, p.id)} className="flex gap-2">
                      <input 
                        type="text" placeholder="Digita commento..." required value={commentText} onChange={(e) => setCommentText(e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-800 p-2 text-xs text-cyan-100 rounded outline-none focus:border-cyan-500"
                      />
                      <button type="submit" className="bg-cyan-600/20 text-cyan-400 px-4 rounded border border-cyan-500/50 hover:bg-cyan-500 hover:text-slate-900 text-[10px] uppercase font-bold">Invia</button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ... MODALI ... */}
      {isModalOpen && (
         <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
         <div className="bg-slate-900 w-full max-w-lg p-8 rounded-2xl border border-cyan-500/40 shadow-2xl">
           <h2 className="text-cyan-400 font-bold mb-6 uppercase tracking-widest">Inizializza Nuovo Trasferimento_Dati</h2>
           <form onSubmit={handleCreate} className="space-y-4">
             <input placeholder="TITOLO_POST" required className="w-full p-4 bg-slate-950 border border-slate-800 rounded outline-none focus:border-cyan-500" value={newPost.title} onChange={e => setNewPost({...newPost, title: e.target.value})} />
             <textarea placeholder="CONTENUTO_TESTUALE..." required className="w-full p-4 bg-slate-950 border border-slate-800 rounded h-32 outline-none focus:border-cyan-500" value={newPost.description} onChange={e => setNewPost({...newPost, description: e.target.value})} />
             <div className="grid grid-cols-2 gap-2">
               <select className="bg-slate-950 border border-slate-800 p-2 text-xs text-cyan-500 outline-none focus:border-cyan-500 rounded" value={newPost.mediaType} onChange={e => setNewPost({...newPost, mediaType: e.target.value})}>
                 <option value="text">SOLO TESTO</option><option value="image">IMMAGINE (URL)</option><option value="video">VIDEO (URL)</option><option value="code">SNIPPET CODICE</option><option value="link">LINK ESTERNO</option>
               </select>
               <input placeholder="URL_MEDIA / CODICE" className="bg-slate-950 border border-slate-800 p-2 text-xs text-white outline-none focus:border-cyan-500 rounded" value={newPost.mediaUrl} onChange={e => setNewPost({...newPost, mediaUrl: e.target.value})} />
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
            <button onClick={() => { localStorage.removeItem('jumper_user'); window.location.reload(); }} className="w-full mt-4 p-3 bg-red-500/10 border border-red-500/50 text-red-400 rounded hover:bg-red-500 hover:text-white transition-all uppercase text-xs font-bold tracking-widest">
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
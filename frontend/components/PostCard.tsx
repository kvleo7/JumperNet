// frontend/components/PostCard.tsx
"use client";
import { useState } from 'react';
import Link from 'next/link';
import { User, Project } from '../types';

interface PostCardProps {
  p: Project; 
  user: User | null; 
  handleUpvote: (projectId: number) => void;
  handleComment: (e: React.FormEvent, projectId: number, text: string) => void;
  handleDeleteComment: (commentId: number, projectId: number) => void;
  onOpenChatWithUser?: (authorId: number) => void; 
}

export default function PostCard({ 
  p, 
  user, 
  handleUpvote, 
  handleComment, 
  handleDeleteComment,
  onOpenChatWithUser
}: PostCardProps) {
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // STATO PER LA MODALE DI CONDIVISIONE
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const submitComment = (e: React.FormEvent) => {
    if (!commentText.trim()) {
      e.preventDefault();
      return;
    }
    handleComment(e, p.id, commentText);
    setCommentText("");
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-lg mb-6 hover:border-cyan-500/30 transition-colors relative z-10">
      
      {/* Header Post */}
      <div className="flex justify-between items-start mb-4">
        
        {/* Menu Utente Dropdown */}
        <div className="relative">
          <div 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 cursor-pointer group hover:bg-slate-800/50 p-2 -ml-2 rounded-lg transition-colors"
          >
            {p.author?.avatar ? (
              <img src={p.author.avatar} alt="avatar" className="w-10 h-10 rounded-full border border-cyan-500/50 object-cover group-hover:scale-105 transition-transform" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 group-hover:scale-105 transition-transform">
                👤
              </div>
            )}
            <div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-cyan-400 uppercase text-sm group-hover:text-cyan-300 transition-colors">{p.author?.username || 'Sconosciuto'}</span>
                {p.author?.verified && <span className="text-[10px]">✅</span>}
              </div>
              <span className="text-[10px] text-slate-500 block">
                {p.createdAt ? new Date(p.createdAt).toLocaleString() : 'Data non disponibile'}
              </span>
            </div>
          </div>

          {/* Sottomenu Profilo/Chat */}
          {showUserMenu && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-slate-900 border border-cyan-500/30 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.8)] z-30 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <Link 
                href={`/user/${p.author?.username || 'sconosciuto'}`}
                className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-300 hover:bg-cyan-900/40 hover:text-cyan-400 transition-colors"
              >
                <span className="text-lg">👤</span> VISITA PROFILO
              </Link>
              
              {user && p.author && user.id !== p.author.id && onOpenChatWithUser && (
                <button 
                  onClick={() => {
                    onOpenChatWithUser(p.author!.id);
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-slate-300 hover:bg-cyan-900/40 hover:text-cyan-400 transition-colors text-left"
                >
                  <span className="text-lg">💬</span> INVIA MESSAGGIO
                </button>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Contenuto Post (Testo) */}
      <div className="text-slate-200 text-sm mb-4 whitespace-pre-wrap">
        {p.description}
      </div>

      {/* Multimedialità */}
      {p.mediaType === 'image' && p.mediaUrl && (
        <img src={p.mediaUrl} alt="media post" className="w-full rounded-lg border border-slate-800 mb-4 object-cover max-h-96" />
      )}
      
      {p.mediaType === 'video' && p.mediaUrl && (
        <video src={p.mediaUrl} controls className="w-full rounded-lg border border-slate-800 mb-4 max-h-96" />
      )}

      {p.mediaType === 'code' && p.mediaUrl && (
        <div className="mb-4 bg-[#0d1117] border border-cyan-500/50 p-4 rounded-xl overflow-x-auto shadow-[inset_0_0_15px_rgba(6,182,212,0.1)]">
          <pre className="text-xs text-cyan-300 font-mono whitespace-pre-wrap">
            <code>{p.mediaUrl}</code>
          </pre>
        </div>
      )}

      {p.mediaType === 'link' && p.mediaUrl && (
        <a href={p.mediaUrl} target="_blank" rel="noopener noreferrer" className="block mb-4 text-cyan-400 hover:text-cyan-300 hover:underline text-sm truncate bg-cyan-900/20 p-3 rounded border border-cyan-500/30 hover:scale-[1.01] transition-transform">
          🔗 {p.mediaUrl}
        </a>
      )}

      {/* AZIONI POST: PULSANTI GRAFICI RINNOVATI */}
      <div className="flex items-center gap-3 border-t border-slate-800 pt-4 mt-2 flex-wrap">
        {/* Tasto LIKE */}
        <button 
          onClick={() => handleUpvote(p.id)}
          className="group relative flex items-center gap-2 px-4 py-2 bg-slate-950 border border-slate-700 rounded-full overflow-hidden transition-all hover:border-pink-500 hover:scale-105 active:scale-95 hover:shadow-[0_0_15px_rgba(236,72,153,0.3)] cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="relative z-10 text-pink-500 group-hover:scale-125 transition-transform duration-300">❤️</span>
          <span className="relative z-10 text-xs font-bold text-slate-300 group-hover:text-white transition-colors tracking-widest">
            {p.likesCount || (p as any).upvotes || 0} LIKE
          </span>
        </button>

        {/* Tasto COMMENTI */}
        <button 
          onClick={() => setShowComments(!showComments)}
          className="group relative flex items-center gap-2 px-4 py-2 bg-slate-950 border border-slate-700 rounded-full overflow-hidden transition-all hover:border-cyan-500 hover:scale-105 active:scale-95 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="relative z-10 text-cyan-500 group-hover:scale-125 transition-transform duration-300">💬</span>
          <span className="relative z-10 text-xs font-bold text-slate-300 group-hover:text-white transition-colors tracking-widest">
            {p.comments?.length || 0} COMMENTI
          </span>
        </button>

        {/* TASTO CONDIVIDI (NUOVO) */}
        <button 
          onClick={() => setIsShareModalOpen(true)}
          className="group relative flex items-center gap-2 px-4 py-2 bg-slate-950 border border-slate-700 rounded-full overflow-hidden transition-all hover:border-emerald-500 hover:scale-105 active:scale-95 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer ml-auto"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="relative z-10 text-emerald-500 group-hover:scale-125 transition-transform duration-300">✈️</span>
          <span className="relative z-10 text-xs font-bold text-slate-300 group-hover:text-white transition-colors tracking-widest hidden sm:inline">
            CONDIVIDI
          </span>
        </button>
      </div>

      {/* Sezione Commenti */}
      {showComments && (
        <div className="mt-5 bg-slate-950/50 rounded-lg p-4 border border-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
          {p.comments && p.comments.map(c => (
            <div key={c.id} className="mb-3 pb-3 border-b border-slate-800/50 last:border-0 last:mb-0 last:pb-0 group flex justify-between items-start">
              <div>
                <span className="text-[10px] text-cyan-500 font-bold uppercase mr-2 cursor-pointer hover:text-cyan-300">{c.author?.username || 'Sconosciuto'}:</span>
                <span className="text-xs text-slate-300 leading-relaxed">{c.text}</span>
              </div>
              {user && user.id === (c as any).authorId && (
                <button 
                  onClick={() => handleDeleteComment(c.id, p.id)}
                  className="text-red-500/50 hover:text-red-500 hover:scale-110 text-[10px] opacity-0 group-hover:opacity-100 transition-all cursor-pointer font-bold tracking-wider ml-2"
                >
                  ELIMINA
                </button>
              )}
            </div>
          ))}

          {/* Form Nuovo Commento */}
          {user ? (
            <form onSubmit={submitComment} className="mt-4 flex gap-2">
              <input 
                type="text" 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Scrivi un commento..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-full px-4 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500 focus:shadow-[0_0_10px_rgba(6,182,212,0.2)] transition-all"
              />
              <button 
                type="submit"
                disabled={!commentText.trim()}
                className="bg-cyan-600/20 border border-cyan-600 text-cyan-400 px-4 py-2 rounded-full text-[10px] font-bold uppercase disabled:opacity-30 disabled:border-slate-700 disabled:text-slate-500 disabled:bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 hover:scale-105 active:scale-95 hover:shadow-[0_0_10px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
              >
                Invia
              </button>
            </form>
          ) : (
            <div className="mt-4 p-3 bg-slate-900 rounded-lg text-[10px] text-slate-400 text-center uppercase tracking-widest border border-slate-800">
              Devi effettuare il login per poter commentare.
            </div>
          )}
        </div>
      )}

      {/* MODALE DI CONDIVISIONE (Z-Index alto per coprire il resto) */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsShareModalOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-red-500 transition-colors text-xl font-black"
            >
              ✕
            </button>
            
            <h3 className="text-white font-bold text-lg mb-4 uppercase tracking-widest flex items-center gap-2">
              <span className="text-emerald-500">✈️</span> Condividi
            </h3>
            
            <div className="space-y-4">
              {/* Opzione 1: Copia Link */}
              <button 
                onClick={() => {
                  const url = `${window.location.origin}/post/${p.id}`;
                  navigator.clipboard.writeText(url);
                  alert("Link copiato negli appunti!");
                  setIsShareModalOpen(false);
                }}
                className="w-full flex items-center justify-center gap-3 p-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700 hover:border-emerald-500 font-bold text-xs tracking-widest uppercase"
              >
                🔗 Copia Link
              </button>

              <div className="flex items-center gap-3 my-2">
                <div className="h-px bg-slate-800 flex-1"></div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest">Oppure</span>
                <div className="h-px bg-slate-800 flex-1"></div>
              </div>

              {/* Opzione 2: Invia in chat rapida (simulato) */}
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-3">Invia in Chat a:</p>
                <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {/* Simulazione Lista Amici */}
                  <button 
                    onClick={() => {
                      alert("Progetto inviato in chat!");
                      setIsShareModalOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded hover:bg-slate-800 transition-colors border border-transparent hover:border-cyan-500/30 group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600">👤</div>
                      <span className="text-sm text-slate-300 font-bold group-hover:text-cyan-400 transition-colors">Neo_Hacker</span>
                    </div>
                    <span className="text-[10px] font-bold bg-cyan-500/20 text-cyan-400 px-3 py-1.5 rounded uppercase tracking-widest group-hover:bg-cyan-500 group-hover:text-slate-900 transition-all">
                      Invia
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
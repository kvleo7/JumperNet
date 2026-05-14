"use client";

import React from 'react';

export default function JumperFeedPage() {
  // --- DATI FINTI (Da sostituire con le chiamate a Prisma/Neon DB) ---

  const currentUser = {
    username: "alex_robotics",
    name: "Alex Elettronica",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maker"
  };

  const stories = [
    { id: 1, username: "sarah_codes", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
    { id: 2, username: "pietro_3d", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pietro" },
    { id: 3, username: "elena_iot", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena" },
    { id: 4, username: "marco_dev", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marco" },
    { id: 5, username: "lucy_circuits", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucy" },
  ];

  const posts = [
    {
      id: 1,
      author: { username: "sarah_codes", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
      location: "Milano, Italy",
      type: "image",
      contentUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800", // Immagine di chip/elettronica
      likes: 342,
      caption: "Ho appena finito di saldare la nuova scheda per il sensore ambientale! 🌡️🌿 Ora devo solo scrivere il firmware in C++.",
      comments: 12,
      timeAgo: "2 ORE FA"
    },
    {
      id: 2,
      author: { username: "pietro_3d", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pietro" },
      location: "Makerspace Roma",
      type: "code",
      contentUrl: null, // Simuliamo un post di tipo "codice"
      likes: 89,
      caption: "Piccolo snippet in Python per gestire i motori passo-passo della mia CNC. Semplice ma efficace! ⚙️💻",
      comments: 4,
      timeAgo: "5 ORE FA"
    }
  ];

  const suggestedUsers = [
    { id: 1, username: "arduino_master", relation: "Nuovo su Jumper", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arduino" },
    { id: 2, username: "tech_nina", relation: "Seguito da sarah_codes", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nina" },
  ];

  // --- ICONE SVG INLINE (Per evitare dipendenze esterne in questo test) ---
  const HeartIcon = () => <svg aria-label="Mi piace" fill="currentColor" height="24" viewBox="0 0 24 24" width="24"><path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.543 1.117 1.543s.277-.368 1.117-1.543a4.21 4.21 0 0 1 3.675-1.941z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></path></svg>;
  const CommentIcon = () => <svg aria-label="Commenta" fill="currentColor" height="24" viewBox="0 0 24 24" width="24"><path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></path></svg>;
  const ShareIcon = () => <svg aria-label="Condividi" fill="currentColor" height="24" viewBox="0 0 24 24" width="24"><line fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" x1="22" x2="9.218" y1="3" y2="10.083"></line><polygon fill="none" points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334" stroke="currentColor" strokeLinejoin="round" strokeWidth="2"></polygon></svg>;
  const BookmarkIcon = () => <svg aria-label="Salva" fill="currentColor" height="24" viewBox="0 0 24 24" width="24"><polygon fill="none" points="20 21 12 13.44 4 21 4 3 20 3 20 21" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polygon></svg>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      
      {/* NAVBAR SUPERIORE */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-black text-2xl tracking-tighter text-blue-600">JUMPER</div>
          
          {/* Barra di ricerca centrale (Nascosta su mobile) */}
          <div className="hidden md:block relative w-64">
            <input 
              type="text" 
              placeholder="Cerca progetti, maker..." 
              className="w-full bg-slate-100 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>

          <div className="flex items-center gap-6 text-slate-700">
            <button className="font-bold text-blue-600">Feed</button>
            <button className="hover:text-blue-600 font-medium transition-colors hidden sm:block">Esplora</button>
            <div className="w-8 h-8 rounded-full border border-slate-200 overflow-hidden cursor-pointer">
              <img src={currentUser.avatar} alt="Il tuo profilo" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </nav>

      {/* CONTENITORE PRINCIPALE (Due Colonne su Desktop, Una su Mobile) */}
      <main className="max-w-5xl mx-auto pt-6 flex justify-center gap-10 px-4">
        
        {/* COLONNA SINISTRA: Feed Centrale */}
        <div className="w-full max-w-[470px]">
          
          {/* SEZIONE STORIE */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 flex gap-4 overflow-x-auto scrollbar-hide">
            <div className="flex flex-col items-center gap-1 cursor-pointer min-w-[70px]">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-slate-100 p-[2px] border-2 border-transparent">
                  <img src={currentUser.avatar} className="w-full h-full rounded-full border border-slate-200" alt="La tua storia" />
                </div>
                <div className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold border-2 border-white">+</div>
              </div>
              <span className="text-[11px] text-slate-500 truncate w-full text-center">La tua storia</span>
            </div>

            {stories.map(story => (
              <div key={story.id} className="flex flex-col items-center gap-1 cursor-pointer min-w-[70px]">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 to-blue-600 p-[2px]">
                  <div className="w-full h-full rounded-full bg-white p-[2px]">
                    <img src={story.avatar} className="w-full h-full rounded-full object-cover" alt={story.username} />
                  </div>
                </div>
                <span className="text-[11px] text-slate-800 truncate w-full text-center">{story.username}</span>
              </div>
            ))}
          </div>

          {/* LISTA DEI POST */}
          <div className="flex flex-col gap-6 pb-20">
            {posts.map(post => (
              <article key={post.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                
                {/* Header Post */}
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3 cursor-pointer">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-400 to-blue-600 p-[2px]">
                      <img src={post.author.avatar} className="w-full h-full rounded-full border-2 border-white object-cover" alt={post.author.username} />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-slate-900">{post.author.username}</h2>
                      {post.location && <p className="text-[11px] text-slate-500">{post.location}</p>}
                    </div>
                  </div>
                  <button className="text-slate-500 hover:text-slate-800 font-bold px-2">•••</button>
                </div>

                {/* Contenuto Post (Immagine o Codice) */}
                {post.type === 'image' ? (
                  <div className="w-full aspect-square bg-slate-100 flex items-center justify-center overflow-hidden">
                    <img src={post.contentUrl!} alt="Post content" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-full aspect-[4/3] bg-slate-900 text-emerald-400 p-6 font-mono text-sm overflow-hidden flex flex-col justify-center">
                    <p>{"def init_motors():"}</p>
                    <p className="pl-4">{"print('Inizializzazione...') "}</p>
                    <p className="pl-4">{"stepper_x = Motor(pin=12)"}</p>
                    <p className="pl-4">{"stepper_y = Motor(pin=14)"}</p>
                    <p className="pl-4">{"stepper_x.enable()"}</p>
                    <p>{"# Jumper Maker Script"}</p>
                  </div>
                )}

                {/* Barra Azioni */}
                <div className="p-3">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex gap-4">
                      <button className="hover:text-slate-500 transition-colors"><HeartIcon /></button>
                      <button className="hover:text-slate-500 transition-colors"><CommentIcon /></button>
                      <button className="hover:text-slate-500 transition-colors"><ShareIcon /></button>
                    </div>
                    <button className="hover:text-slate-500 transition-colors"><BookmarkIcon /></button>
                  </div>

                  {/* Mi piace & Caption */}
                  <p className="text-sm font-semibold mb-1">{post.likes} Mi piace</p>
                  <p className="text-sm text-slate-900 mb-1">
                    <span className="font-semibold mr-2">{post.author.username}</span>
                    {post.caption}
                  </p>
                  
                  {/* Info Aggiuntive */}
                  <button className="text-sm text-slate-500 mb-1">Mostra tutti e {post.comments} i commenti</button>
                  <p className="text-[10px] text-slate-400 font-semibold mb-3">{post.timeAgo}</p>

                  {/* Aggiungi Commento */}
                  <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
                    <input 
                      type="text" 
                      placeholder="Aggiungi un commento..." 
                      className="flex-1 text-sm outline-none bg-transparent"
                    />
                    <button className="text-blue-600 font-semibold text-sm hover:text-blue-800 disabled:opacity-50">
                      Pubblica
                    </button>
                  </div>
                </div>

              </article>
            ))}
          </div>
        </div>

        {/* COLONNA DESTRA: Sidebar Utente & Suggerimenti (Solo su Desktop) */}
        <div className="hidden lg:block w-[320px] pt-4">
          
          {/* Mini-profilo Utente Loggato */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="w-12 h-12 rounded-full border border-slate-200 overflow-hidden">
                 <img src={currentUser.avatar} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">{currentUser.username}</h2>
                <p className="text-sm text-slate-500">{currentUser.name}</p>
              </div>
            </div>
            <button className="text-xs font-bold text-blue-600 hover:text-blue-800">Passa a</button>
          </div>

          {/* Sezione Suggeriti */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-500">Suggeriti per te</span>
            <button className="text-xs font-bold hover:text-slate-500">Mostra tutti</button>
          </div>

          <div className="flex flex-col gap-4">
            {suggestedUsers.map(user => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3 cursor-pointer">
                  <div className="w-8 h-8 rounded-full border border-slate-200 overflow-hidden">
                    <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold leading-none">{user.username}</span>
                    <span className="text-xs text-slate-500 mt-1">{user.relation}</span>
                  </div>
                </div>
                <button className="text-xs font-bold text-blue-600 hover:text-blue-800">Segui</button>
              </div>
            ))}
          </div>

          {/* Footer Sidebar */}
          <div className="mt-8 text-xs text-slate-400 flex flex-col gap-4">
            <p className="flex flex-wrap gap-x-2 gap-y-1">
              <a href="#" className="hover:underline">Informazioni</a>
              <a href="#" className="hover:underline">Assistenza</a>
              <a href="#" className="hover:underline">API</a>
              <a href="#" className="hover:underline">Privacy</a>
              <a href="#" className="hover:underline">Condizioni</a>
            </p>
            <p>© 2024 JUMPER FROM MAKERS</p>
          </div>

        </div>
      </main>
    </div>
  );
}
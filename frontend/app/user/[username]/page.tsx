// frontend/app/user/[username]/page.tsx
"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
// IMPORT CORRETTO: 3 livelli per uscire da [username] -> user -> app
import PostCard from '../../../components/PostCard'; 

interface User {
  id: number;
  username: string;
  avatar: string | null;
  bio?: string;
  link?: string;
  verified?: boolean;
}

interface Project {
  id: number;
  authorId?: number;
  userId?: number;
  user_id?: number;
  author_id?: number;
  description: string;
  mediaUrl: string | null;
  mediaType: string | null;
  likesCount?: number;
  comments?: any[];
  author?: User; 
}

export default function UserProfile() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;

  const [currentUser, setCurrentUser] = useState<User | null>(null); 
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [friendsCount, setFriendsCount] = useState(0); 
  const [followingCount, setFollowingCount] = useState(0); 

  useEffect(() => {
    const userStr = localStorage.getItem('jumper_user');
    if (userStr && userStr !== "undefined") {
      setCurrentUser(JSON.parse(userStr));
    }
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const usersRes = await fetch('${process.env.NEXT_PUBLIC_API_URL}/api/users');
        const users: User[] = await usersRes.json();
        
        const targetUsername = decodeURIComponent(username).toLowerCase();
        const foundUser = users.find(u => u.username.toLowerCase() === targetUsername);
        
        if (foundUser) {
          setUserProfile(foundUser);
          
          setFollowersCount(0);
          setFriendsCount(0);
          setFollowingCount(0); 

          const projRes = await fetch('${process.env.NEXT_PUBLIC_API_URL}/api/projects');
          const allProjects: Project[] = await projRes.json();

          const myProjects = allProjects.filter((p: any) => {
            const targetId = Number(foundUser.id);
            return (
              Number(p.authorId) === targetId ||
              Number(p.userId) === targetId ||
              Number(p.user_id) === targetId ||
              Number(p.author_id) === targetId
            );
          }).map(p => ({
            ...p,
            author: foundUser 
          }));

          setUserProjects(myProjects);
        }
      } catch (error) {
        console.error("Errore profilo:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (username) fetchUserData();
  }, [username]);

  const toggleFollow = () => {
    if (isFollowing) {
      setFollowersCount(prev => prev - 1);
      setFollowingCount(prev => prev - 1);
      setFriendsCount(prev => prev - 1);
      setIsFollowing(false);
    } else {
      setFollowersCount(prev => prev + 1);
      setFollowingCount(prev => prev + 1);
      setFriendsCount(prev => prev + 1);
      setIsFollowing(true);
    }
  };

  const handleMessageClick = () => {
    if (!userProfile) return;
    router.push(`/chat?target=${userProfile.id}`);
  };

  const handleUpvote = async (projectId: number) => {
    if (!currentUser) return alert("Devi essere loggato!");
    const updateProjects = (projects: Project[]) => 
      projects.map(p => p.id === projectId ? { ...p, likesCount: (p.likesCount || 0) + 1 } : p);
    
    setUserProjects(updateProjects);
    if (selectedProject?.id === projectId) {
      setSelectedProject(prev => prev ? { ...prev, likesCount: (prev.likesCount || 0) + 1 } : prev);
    }
  };

  const handleComment = async (e: React.FormEvent, projectId: number, text: string) => {
    if (e) e.preventDefault();
    if (!currentUser || !text.trim()) return;
    
    const newComment = { id: Date.now(), text, author: currentUser };
    
    const updateProjects = (projects: Project[]) =>
      projects.map(p => p.id === projectId ? { ...p, comments: [...(p.comments || []), newComment] } : p);

    setUserProjects(updateProjects);
    if (selectedProject?.id === projectId) {
      setSelectedProject(prev => prev ? { ...prev, comments: [...(prev.comments || []), newComment] } : prev);
    }
  };

  const handleDeleteComment = async (commentId: number, projectId: number) => {
    const updateProjects = (projects: Project[]) =>
      projects.map(p => p.id === projectId ? { ...p, comments: (p.comments || []).filter(c => c.id !== commentId) } : p);

    setUserProjects(updateProjects);
    if (selectedProject?.id === projectId) {
      setSelectedProject(prev => prev ? { ...prev, comments: (prev.comments || []).filter(c => c.id !== commentId) } : prev);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center font-mono text-cyan-500 animate-pulse text-xl tracking-widest">RICERCA_UTENTE_IN_CORSO...</div>;
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-mono gap-4">
        <div className="text-red-500 text-2xl tracking-widest">ERRORE: 404</div>
        <div className="text-slate-400">Nessun utente trovato: @{decodeURIComponent(username)}</div>
        <button onClick={() => router.back()} className="mt-4 px-4 py-2 border border-cyan-500 text-cyan-500 rounded hover:bg-cyan-500 hover:text-slate-900 transition-colors">TORNA ALLA BASE</button>
      </div>
    );
  }

  const isMyProfile = currentUser !== null && currentUser.username.toLowerCase() === userProfile.username.toLowerCase();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 font-mono pb-10">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(30,58,138,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(30,58,138,0.05)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none z-0"></div>

      <div className="relative z-10 max-w-4xl mx-auto pt-6 px-4">
        <button onClick={() => router.push('/feed')} className="text-cyan-500 hover:text-cyan-300 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-transform hover:-translate-x-2">
          ← Torna al Feed
        </button>
      </div>

      <div className="max-w-4xl mx-auto mt-8 px-4 relative z-10">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-10 backdrop-blur-md shadow-2xl flex flex-col md:flex-row gap-8 items-center md:items-start">
          
          <div className="shrink-0 relative group">
            <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full border-4 ${isMyProfile ? 'border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)]' : 'border-slate-800 group-hover:border-cyan-500'} flex items-center justify-center bg-slate-950 overflow-hidden transition-all duration-300`}>
              {userProfile.avatar ? (
                <img src={userProfile.avatar} alt={userProfile.username} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              ) : (
                <span className="text-6xl">👤</span>
              )}
            </div>
          </div>

          <div className="flex-1 w-full text-center md:text-left space-y-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
              <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-wider">
                @{userProfile.username} {isMyProfile && <span className="text-[10px] bg-cyan-500 text-black px-2 py-0.5 ml-2 rounded align-middle">TU</span>}
              </h1>
              
              {!isMyProfile && (
                <div className="flex gap-2 justify-center">
                  <button onClick={toggleFollow} className={`px-6 py-2 rounded font-bold text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${isFollowing ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-cyan-500 text-slate-950'}`}>
                    {isFollowing ? 'Smetti' : 'Segui'}
                  </button>
                  <button onClick={handleMessageClick} className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 text-cyan-400 font-bold text-xs uppercase tracking-widest rounded hover:border-cyan-500 transition-all hover:scale-105 active:scale-95">
                    <span className="text-lg">💬</span> MSG
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-6 justify-center md:justify-start border-y border-slate-800/50 py-4">
              <div className="text-center"><span className="block text-white font-bold text-lg">{userProjects.length}</span><span className="text-[10px] text-slate-500 uppercase tracking-widest">Progetti</span></div>
              <div className="text-center"><span className="block text-white font-bold text-lg">{followersCount}</span><span className="text-[10px] text-slate-500 uppercase tracking-widest">Follower</span></div>
              <div className="text-center"><span className="block text-cyan-400 font-bold text-lg">{friendsCount}</span><span className="text-[10px] text-cyan-700 uppercase tracking-widest">Amici</span></div>
              <div className="text-center"><span className="block text-white font-bold text-lg">{followingCount}</span><span className="text-[10px] text-slate-500 uppercase tracking-widest">Seguiti</span></div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-slate-400 leading-relaxed">
                {userProfile.bio || "Nessuna biografia inserita nei registri di sistema."}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-8 h-px bg-slate-800"></span> ARCHIVIO_PROGETTI
          </h2>
          
          {userProjects.length > 0 ? (
            /* GRIGLIA STILE INSTAGRAM: 3 colonne, gap minimo (1px/2px), senza bordi arrotondati */
            <div className="grid grid-cols-3 gap-[2px] md:gap-1">
              {userProjects.map((project) => (
                <div 
                  key={project.id} 
                  onClick={() => setSelectedProject(project)}
                  className="aspect-square bg-slate-900 overflow-hidden cursor-pointer group relative flex items-center justify-center"
                >
                  {project.mediaType === 'image' && project.mediaUrl ? (
                    <img src={project.mediaUrl} alt="Progetto" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : project.mediaType === 'video' ? (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800"><span className="text-3xl opacity-60">🎥</span></div>
                  ) : project.mediaType === 'code' ? (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800"><span className="text-3xl opacity-60">⌨️</span></div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800"><span className="text-3xl opacity-60">📁</span></div>
                  )}
                  
                  {/* Overlay on hover come IG (mostra i like) */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-20">
                    <span className="text-white font-bold text-sm md:text-base flex items-center gap-1">❤️ {project.likesCount || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-10 border border-dashed border-slate-800 text-slate-500 text-xs uppercase tracking-widest">
              Nessun progetto caricato.
            </div>
          )}
        </div>
      </div>

      {selectedProject && currentUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-200">
          
          <button 
            onClick={() => setSelectedProject(null)}
            className="absolute top-4 right-4 md:top-8 md:right-8 text-white bg-slate-800/80 hover:bg-red-500 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-xl font-black transition-colors z-50 backdrop-blur-sm"
          >
            ✕
          </button>

          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar rounded-2xl relative shadow-2xl">
            <PostCard 
              p={selectedProject as any} 
              user={currentUser as any} 
              handleUpvote={handleUpvote} 
              handleComment={handleComment} 
              handleDeleteComment={handleDeleteComment} 
            />
          </div>
        </div>
      )}
    </main>
  );
}
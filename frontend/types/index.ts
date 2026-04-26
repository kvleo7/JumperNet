// frontend/types/index.ts

export interface User {
  id: number;
  username: string;
  avatar?: string;
  verified?: boolean; // Aggiunto come opzionale visto che in PostCard controlli se ha la spunta blu
}

export interface Comment {
  id: number;
  text: string;
  authorId: number; // Rinominato da userId per far combaciare tutto col frontend
  author?: User;    // Ora usa l'interfaccia User completa, quindi ha 'id', 'username', ecc!
  createdAt?: string; 
}

export interface Project {
  id: number;
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: string;
  likesCount: number;
  upvotes?: number; // Aggiunto per coprire il fallback che usavi
  createdAt: string; // AGGIUNTO! Ecco la data che mancava
  author?: User;
  comments?: Comment[];
}

export interface NewPost {
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: string;
}
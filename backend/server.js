require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const app = express();

const prisma = new PrismaClient();

app.use(cors({
  // In produzione imposta FRONTEND_URL (es. https://jumpernet.vercel.app)
  origin: process.env.FRONTEND_URL || "*"
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ==========================================
// REGISTRAZIONE
// ==========================================
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      error: "Dati mancanti. Compila tutti i campi."
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        verified: true
      }
    });

    res.status(200).json({
      success: true,
      message: "Registrazione completata con successo."
    });

  } catch (e) {
    console.error("Errore registrazione:", e);

    res.status(400).json({
      error: "Username o Email già esistenti."
    });
  }
});

// ==========================================
// LOGIN
// ==========================================
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "Email e password richiesti."
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        error: "Credenziali non valide."
      });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      website: user.website
    });

  } catch (e) {
    console.error("Errore login:", e);

    res.status(500).json({
      error: "Errore del server."
    });
  }
});

// ==========================================
// VERIFICA EMAIL (lasciata per compatibilità)
// ==========================================
app.get('/api/verify', async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Sistema verifica disattivato."
  });
});

// ==========================================
// AGGIORNA PROFILO UTENTE
// ==========================================
app.put('/api/users/:id', async (req, res) => {
  const userId = parseInt(req.params.id);

  const { username, avatar, bio, website } = req.body;

  try {

    if (username) {
      const existingUser = await prisma.user.findUnique({
        where: { username }
      });

      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({
          error: "Questo username è già in uso!"
        });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { username, avatar, bio, website }
    });

    res.json({
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      bio: updatedUser.bio,
      website: updatedUser.website
    });

  } catch (e) {
    console.error(e);

    res.status(500).json({
      error: "Errore durante l'aggiornamento."
    });
  }
});

// ==========================================
// PROGETTI (LISTA)
// ==========================================
app.get('/api/projects', async (req, res) => {
  try {

    const projects = await prisma.project.findMany({
      include: {
        author: {
          select: {
            username: true
          }
        },

        comments: {
          include: {
            author: {
              select: {
                username: true
              }
            }
          }
        },

        _count: {
          select: {
            likes: true
          }
        }
      },

      orderBy: {
        id: "desc"
      }
    });

    const formatted = projects.map(p => ({
      ...p,
      likesCount: p._count.likes
    }));

    res.json(formatted);

  } catch (e) {
    console.error(e);

    res.status(500).json({
      error: "Errore caricamento progetti."
    });
  }
});

// ==========================================
// PROGETTI (CREA)
// ==========================================
app.post('/api/projects', async (req, res) => {
  const {
    title,
    description,
    mediaUrl,
    mediaType,
    userId
  } = req.body;

  try {

    const newProject = await prisma.project.create({
      data: {
        title,
        description,
        mediaUrl,
        mediaType,
        userId
      },

      include: {
        author: {
          select: {
            username: true
          }
        },

        comments: true
      }
    });

    res.json({
      ...newProject,
      likesCount: 0
    });

  } catch (e) {
    console.error(e);

    res.status(500).json({
      error: "Errore salvataggio."
    });
  }
});

// ==========================================
// PROGETTI (MODIFICA)
// ==========================================
app.put('/api/projects/:id', async (req, res) => {
  const projectId = parseInt(req.params.id);

  const {
    title,
    description,
    mediaUrl,
    mediaType
  } = req.body;

  try {

    const updatedProject = await prisma.project.update({
      where: {
        id: projectId
      },

      data: {
        title,
        description,
        mediaUrl,
        mediaType
      },

      include: {
        author: {
          select: {
            username: true
          }
        },

        comments: true
      }
    });

    res.json(updatedProject);

  } catch (e) {
    console.error("Errore modifica progetto:", e);

    res.status(500).json({
      error: "Errore durante la modifica del progetto."
    });
  }
});

// ==========================================
// PROGETTI (ELIMINA)
// ==========================================
app.delete('/api/projects/:id', async (req, res) => {
  const projectId = parseInt(req.params.id);

  try {

    await prisma.like.deleteMany({
      where: {
        projectId
      }
    });

    await prisma.comment.deleteMany({
      where: {
        projectId
      }
    });

    await prisma.project.delete({
      where: {
        id: projectId
      }
    });

    res.json({
      success: true
    });

  } catch (e) {
    console.error("Errore eliminazione progetto:", e);

    res.status(500).json({
      error: "Errore durante l'eliminazione del progetto."
    });
  }
});

// ==========================================
// PROGETTI UTENTE
// ==========================================
app.get('/api/users/:id/projects', async (req, res) => {
  try {

    const userId = parseInt(req.params.id);

    const userProjects = await prisma.project.findMany({
      where: {
        userId: userId
      },

      include: {
        author: {
          select: {
            username: true
          }
        },

        _count: {
          select: {
            likes: true
          }
        }
      },

      orderBy: {
        id: 'desc'
      }
    });

    const formatted = userProjects.map(p => ({
      ...p,
      likesCount: p._count.likes
    }));

    res.json(formatted);

  } catch (e) {

    res.status(500).json({
      error: "Errore durante il caricamento dei progetti dell'utente."
    });
  }
});

// ==========================================
// LIKE
// ==========================================
app.post('/api/projects/:id/like', async (req, res) => {
  const projectId = parseInt(req.params.id);

  const { userId } = req.body;

  try {

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId
        }
      }
    });

    if (existingLike) {

      await prisma.like.delete({
        where: {
          id: existingLike.id
        }
      });

    } else {

      await prisma.like.create({
        data: {
          userId,
          projectId
        }
      });
    }

    const count = await prisma.like.count({
      where: {
        projectId
      }
    });

    res.json({
      success: true,
      likesCount: count
    });

  } catch (e) {
    console.error(e);

    res.status(500).json({
      error: "Errore di sistema durante l'upvote."
    });
  }
});

// ==========================================
// COMMENTI (CREA)
// ==========================================
app.post('/api/projects/:id/comments', async (req, res) => {
  const projectId = parseInt(req.params.id);

  const { text, userId } = req.body;

  try {

    const newComment = await prisma.comment.create({
      data: {
        text,
        userId,
        projectId
      },

      include: {
        author: {
          select: {
            username: true
          }
        }
      }
    });

    res.json(newComment);

  } catch (e) {

    res.status(500).json({
      error: "Errore durante l'invio del commento."
    });
  }
});

// ==========================================
// COMMENTI (ELIMINA)
// ==========================================
app.delete('/api/comments/:id', async (req, res) => {
  const commentId = parseInt(req.params.id);

  try {

    await prisma.comment.delete({
      where: {
        id: commentId
      }
    });

    res.json({
      success: true,
      message: "Commento eliminato"
    });

  } catch (e) {
    console.error("Errore eliminazione commento:", e);

    res.status(500).json({
      error: "Errore durante l'eliminazione del commento."
    });
  }
});

// ==========================================
// CHAT
// ==========================================

// INVIA MESSAGGIO
app.post('/api/messages', async (req, res) => {
  const {
    text,
    senderId,
    receiverId
  } = req.body;

  if (!text || !senderId || !receiverId) {
    return res.status(400).json({
      error: "Dati mancanti per l'invio del messaggio"
    });
  }

  try {

    const message = await prisma.message.create({
      data: {
        text,
        senderId: parseInt(senderId),
        receiverId: parseInt(receiverId),
      },

      include: {
        sender: {
          select: {
            username: true,
            avatar: true
          }
        },
      },
    });

    res.json(message);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Errore nell'invio del messaggio"
    });
  }
});

// RECUPERA CHAT
app.get('/api/messages/:userId/:contactId', async (req, res) => {
  const { userId, contactId } = req.params;

  try {

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: parseInt(userId),
            receiverId: parseInt(contactId)
          },

          {
            senderId: parseInt(contactId),
            receiverId: parseInt(userId)
          },
        ],
      },

      orderBy: {
        createdAt: 'asc'
      },

      include: {
        sender: {
          select: {
            username: true,
            avatar: true
          }
        },
      },
    });

    res.json(messages);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Errore nel recupero dei messaggi"
    });
  }
});

// ==========================================
// LISTA UTENTI
// ==========================================
app.get('/api/users', async (req, res) => {
  try {

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        avatar: true,
        verified: true
      }
    });

    res.json(users);

  } catch (error) {

    res.status(500).json({
      error: "Errore nel recupero utenti"
    });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 JUMPER_NET Backend online sulla porta ${PORT}`);
});
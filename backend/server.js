require('dotenv').config(); // Carica le variabili dal file .env
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
// Prisma si connetterà in automatico a Neon leggendo il file .env!
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ==========================================
// PROTOCOLLO INVIO EMAIL (Test Locale)
// ==========================================
async function sendVerificationEmail(userEmail, token) {
  let testAccount = await nodemailer.createTestAccount();
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });

  const verifyUrl = `http://localhost:3000/verify?token=${token}`;

  let info = await transporter.sendMail({
    from: '"JUMPER_NET ADMIN" <admin@jumpernet.local>',
    to: userEmail,
    subject: "Terminale JUMPER_NET - Verifica Identità",
    text: `Inizializzazione account. Clicca sul link per verificare la tua identità: ${verifyUrl}`,
    html: `<h3>Benvenuto su JUMPER_NET</h3><p>Clicca sul link per verificare l'accesso:</p><a href="${verifyUrl}">${verifyUrl}</a>`,
  });

  console.log("⚠️ [DEBUG] Anteprima Email disponibile qui: %s", nodemailer.getTestMessageUrl(info));
}

// ==========================================
// REGISTRAZIONE CON VERIFICA
// ==========================================
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  
  try {
    // 1. Cripta la password
    const hashedPassword = await bcrypt.hash(password, 10);
    // 2. Genera un token casuale di 32 caratteri
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // 3. Salva nel DB tramite Prisma (incluso il token e lo stato non verificato)
    await prisma.user.create({
      data: { 
        username, 
        email, 
        password: hashedPassword,
        verified: false,
        verificationToken: verificationToken
      }
    });

    // 4. Invia l'email magica
    await sendVerificationEmail(email, verificationToken);

    res.status(200).json({ success: true, message: "Registrazione completata. Controlla la tua email per il link di verifica." });
  } catch (e) {
    console.error("Errore registrazione:", e);
    res.status(400).json({ error: "Username o Email già esistenti." });
  }
});

// ==========================================
// LOGIN
// ==========================================
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Credenziali non valide." });
    }
    
    // Controllo sicurezza: Blocca se non è verificato
    if (!user.verified) {
      return res.status(403).json({ error: "Accesso negato: account non verificato. Controlla l'email." });
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
    res.status(500).json({ error: "Errore del server." });
  }
});

// ==========================================
// VERIFICA EMAIL
// ==========================================
app.get('/api/verify', async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: "Nessun token fornito." });
  }

  try {
    // 1. Cerca un utente che abbia questo esatto token
    const user = await prisma.user.findFirst({
      where: { verificationToken: token }
    });

    if (!user) {
      return res.status(400).json({ error: "Codice di verifica non valido o già utilizzato." });
    }

    // 2. Se lo trova, aggiorna l'utente: lo verifica e cancella il token
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        verified: true, 
        verificationToken: null // Svuotiamo il token per sicurezza
      }
    });

    res.status(200).json({ success: true, message: "Identità verificata con successo!" });
  } catch (error) {
    console.error("Errore durante la verifica:", error);
    res.status(500).json({ error: "Errore interno del server." });
  }
});

// ==========================================
// AGGIORNA PROFILO UTENTE
// ==========================================
app.put('/api/users/:id', async (req, res) => {
  const userId = parseInt(req.params.id);
  const { username, avatar, bio, website } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser && existingUser.id !== userId) {
      return res.status(400).json({ error: "Questo username è già in uso!" });
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
    res.status(500).json({ error: "Errore durante l'aggiornamento." });
  }
});

// ==========================================
// PROGETTI (LISTA)
// ==========================================
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        author: { select: { username: true } },
        comments: { include: { author: { select: { username: true } } } },
        _count: { select: { likes: true } }
      },
      orderBy: { id: "desc" } 
    });
    const formatted = projects.map(p => ({ ...p, likesCount: p._count.likes }));
    res.json(formatted);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Errore caricamento progetti." });
  }
});

// ==========================================
// PROGETTI (CREA)
// ==========================================
app.post('/api/projects', async (req, res) => {
  const { title, description, mediaUrl, mediaType, userId } = req.body;
  try {
    const newProject = await prisma.project.create({
      data: { title, description, mediaUrl, mediaType, userId },
      include: { 
        author: { select: { username: true } },
        comments: true 
      }
    });
    res.json({ ...newProject, likesCount: 0 });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Errore salvataggio." });
  }
});

// ==========================================
// PROGETTI (MODIFICA) - NUOVA ROTTA 🛠️
// ==========================================
app.put('/api/projects/:id', async (req, res) => {
  const projectId = parseInt(req.params.id);
  const { title, description, mediaUrl, mediaType } = req.body;
  
  try {
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { title, description, mediaUrl, mediaType },
      include: { 
        author: { select: { username: true } },
        comments: true 
      }
    });
    
    res.json(updatedProject);
  } catch (e) {
    console.error("Errore modifica progetto:", e);
    res.status(500).json({ error: "Errore durante la modifica del progetto." });
  }
});

// ==========================================
// PROGETTI (ELIMINA IN SICUREZZA)
// ==========================================
app.delete('/api/projects/:id', async (req, res) => {
  const projectId = parseInt(req.params.id);
  try {
    // 1. Elimina prima tutti i like collegati a questo progetto
    await prisma.like.deleteMany({ where: { projectId } });
    
    // 2. Elimina tutti i commenti collegati a questo progetto
    await prisma.comment.deleteMany({ where: { projectId } });
    
    // 3. Ora che è libero, elimina il progetto in sicurezza
    await prisma.project.delete({ where: { id: projectId } });
    
    res.json({ success: true });
  } catch (e) {
    console.error("Errore eliminazione progetto:", e);
    res.status(500).json({ error: "Errore durante l'eliminazione del progetto." });
  }
});

// ==========================================
// PROGETTI DI UN SINGOLO UTENTE
// ==========================================
app.get('/api/users/:id/projects', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const userProjects = await prisma.project.findMany({
      where: { userId: userId },
      include: { 
        author: { select: { username: true } },
        _count: { select: { likes: true } }
      },
      orderBy: { id: 'desc' }
    });
    const formatted = userProjects.map(p => ({ ...p, likesCount: p._count.likes }));
    res.json(formatted);
  } catch (e) {
    res.status(500).json({ error: "Errore durante il caricamento dei progetti dell'utente." });
  }
});

// ==========================================
// INTERAZIONI: UPVOTES E COMMENTI
// ==========================================

// --- UPVOTES (Toggle) ---
app.post('/api/projects/:id/like', async (req, res) => {
  const projectId = parseInt(req.params.id);
  const { userId } = req.body;

  try {
    const existingLike = await prisma.like.findUnique({
      where: { userId_projectId: { userId, projectId } }
    });

    if (existingLike) {
      await prisma.like.delete({ where: { id: existingLike.id } });
    } else {
      await prisma.like.create({ data: { userId, projectId } });
    }

    const count = await prisma.like.count({ where: { projectId } });
    res.json({ success: true, likesCount: count });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Errore di sistema durante l'upvote." });
  }
});

// --- COMMENTI (CREA) ---
app.post('/api/projects/:id/comments', async (req, res) => {
  const projectId = parseInt(req.params.id);
  const { text, userId } = req.body;
  try {
    const newComment = await prisma.comment.create({
      data: { text, userId, projectId },
      include: { author: { select: { username: true } } }
    });
    res.json(newComment);
  } catch (e) {
    res.status(500).json({ error: "Errore durante l'invio del commento." });
  }
});

// --- COMMENTI (ELIMINA) - NUOVA ROTTA 🛠️ ---
app.delete('/api/comments/:id', async (req, res) => {
  const commentId = parseInt(req.params.id);
  try {
    await prisma.comment.delete({ where: { id: commentId } });
    res.json({ success: true, message: "Commento eliminato" });
  } catch (e) {
    console.error("Errore eliminazione commento:", e);
    res.status(500).json({ error: "Errore durante l'eliminazione del commento." });
  }
});

app.listen(3001, () => console.log('🚀 JUMPER_NET Backend su http://localhost:3001'));
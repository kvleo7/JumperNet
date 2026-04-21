const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Inizio inserimento dati...');

  // 1. Crea l'utente
  const user = await prisma.user.upsert({
    where: { email: 'leo@test.com' },
    update: {},
    create: {
      username: 'LeoMaker',
      email: 'leo@test.com',
    },
  });

  console.log('Utente creato/verificato:', user);

  // 2. Crea il progetto collegato all'utente
  const project = await prisma.project.create({
    data: {
      title: 'Mio Primo Progetto Jumper',
      description: 'Questo progetto è stato creato via codice!',
      userId: user.id,
    },
  });

  console.log('Progetto creato con successo:', project);
}

main()
  .catch((e) => {
    console.error('Errore durante il seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
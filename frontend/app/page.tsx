"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function WelcomePage() {
  return (
    // Sfondo principale: ho usato un grigio molto scuro, quasi nero, tipico dei terminali
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 flex flex-col relative overflow-hidden">
      
      {/* Sfondo Animato (Luci soffuse) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        {/* Cambia "bg-emerald-600/10" con il colore principale del tuo tema se vuoi cambiare la luce */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-600/10 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-cyan-600/10 blur-[150px] rounded-full mix-blend-screen"></div>
      </div>

      {/* NAVBAR */}
      <nav className="w-full p-6 flex justify-between items-center z-10">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          // Colore del Logo: Qui puoi mettere il colore esatto che usi nell'header delle altre pagine
          className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500"
        >
          JUMPER_NET
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex gap-4"
        >
          <Link href="/login" className="px-5 py-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors duration-300">
            Accedi
          </Link>
          {/* Pulsante Registrati: Cambia "bg-emerald-600" con il colore dei tuoi pulsanti standard */}
          <Link href="/register" className="px-5 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all duration-300 hover:scale-105">
            Registrati
          </Link>
        </motion.div>
      </nav>

      {/* CONTENUTO PRINCIPALE */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 z-10">
        
        {/* Titolo */}
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-white"
        >
          Benvenuto nel <span className="text-emerald-500">Terminale</span>
        </motion.h1>

        {/* Descrizione */}
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-2xl text-lg md:text-xl text-gray-400 mb-12"
        >
          Jumper_Net è la rete definitiva per condividere, esplorare e votare i migliori progetti creativi. 
          Entra nella community, carica i tuoi file e fai esplodere le tue idee.
        </motion.p>

        {/* Griglia Immagini */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl"
        >
          {/* Card 1 */}
          <div className="relative group overflow-hidden rounded-xl bg-[#111] border border-gray-800 aspect-video shadow-lg">
            <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop" alt="Progetti Tech" className="object-cover w-full h-full opacity-50 group-hover:opacity-90 group-hover:scale-110 transition-all duration-700" />
            <div className="absolute bottom-4 left-4 text-left pointer-events-none">
              <h3 className="font-bold text-gray-200 text-lg">Tecnologia</h3>
            </div>
          </div>

          {/* Card 2 */}
          <div className="relative group overflow-hidden rounded-xl bg-[#111] border border-gray-800 aspect-video shadow-lg md:-translate-y-6">
            <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop" alt="Arte Creativa" className="object-cover w-full h-full opacity-50 group-hover:opacity-90 group-hover:scale-110 transition-all duration-700" />
            <div className="absolute bottom-4 left-4 text-left pointer-events-none">
              <h3 className="font-bold text-gray-200 text-lg">Creatività</h3>
            </div>
          </div>

          {/* Card 3 */}
          <div className="relative group overflow-hidden rounded-xl bg-[#111] border border-gray-800 aspect-video shadow-lg">
            <img src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop" alt="Codice" className="object-cover w-full h-full opacity-50 group-hover:opacity-90 group-hover:scale-110 transition-all duration-700" />
            <div className="absolute bottom-4 left-4 text-left pointer-events-none">
              <h3 className="font-bold text-gray-200 text-lg">Sviluppo</h3>
            </div>
          </div>
        </motion.div>

      </main>
    </div>
  );
}
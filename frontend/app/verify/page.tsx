"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function VerifyTerminal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState({ text: 'Inizializzazione decrittazione token...', type: 'info' });

  useEffect(() => {
    if (!token) {
      setStatus({ text: '❌ ERRORE: Nessun token di sicurezza rilevato nell\'URL.', type: 'error' });
      return;
    }

    const verifyAccount = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/verify?token=${token}`);
        const data = await res.json();

        if (res.ok) {
          // IL MESSAGGIO ESATTO RICHIESTO:
          setStatus({ text: '✅ AUTENTICATO CON SUCCESSO! ORA PUOI ACCEDERE.', type: 'success' });
          
          // Dopo 3 secondi, rimanda l'utente alla pagina di login in automatico
          setTimeout(() => {
            router.push('/login');
          }, 3000);
        } else {
          setStatus({ text: `❌ ACCESSO NEGATO: ${data.error}`, type: 'error' });
        }
      } catch (err) {
        setStatus({ text: '❌ ERRORE CRITICO: Impossibile connettersi al server centrale.', type: 'error' });
      }
    };

    verifyAccount();
  }, [token, router]);

  return (
    <div className="text-center">
      <h1 className="text-2xl font-black text-cyan-400 tracking-widest uppercase mb-4">
        Verifica di Rete
      </h1>
      
      <div className={`p-4 mb-6 text-sm font-bold border ${
        status.type === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 
        status.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 
        'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 animate-pulse'
      }`}>
        {status.text}
      </div>

      {status.type === 'success' && (
        <p className="text-slate-400 text-xs uppercase tracking-widest mt-4 animate-pulse">
          Reindirizzamento al terminale di login in corso...
        </p>
      )}

      {status.type === 'error' && (
        <Link href="/login" className="inline-block mt-4 text-cyan-500/70 hover:text-cyan-400 text-xs uppercase tracking-widest transition-colors">
          [ Torna al Terminale di Login ]
        </Link>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 font-mono">
      <div className="w-full max-w-md bg-slate-900 border border-cyan-500/30 p-8 rounded-xl shadow-[0_0_40px_rgba(6,182,212,0.1)]">
        {/* Usiamo Suspense perché in Next.js useSearchParams richiede un boundary per non dare errori in produzione */}
        <Suspense fallback={<div className="text-cyan-400 text-center animate-pulse">Caricamento modulo di sicurezza...</div>}>
          <VerifyTerminal />
        </Suspense>
      </div>
    </div>
  );
}
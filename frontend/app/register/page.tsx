"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { dict, Lang } from '../../utils/translations';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [lang, setLang] = useState<Lang>('it');
  const router = useRouter();

  useEffect(() => {
    const savedLang = localStorage.getItem('sys_lang') as Lang;
    if (savedLang) setLang(savedLang);
  }, []);

  const t = dict[lang] || dict['it'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('http://localhost:3001/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });

    if (res.ok) {
      // Invece di loggare l'utente, lo mandiamo al login con un messaggio di successo
      // Usiamo i parametri dell'URL per dire alla pagina di login cosa mostrare
      router.push('/login?success=true');
    } else {
      const errorData = await res.json();
      setErrorMsg(errorData.error || "ERRORE_DI_SISTEMA");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 font-mono relative overflow-hidden">
      {/* Sfondo e stile rimangono uguali... (omessi per brevità) */}
      <form onSubmit={handleSubmit} className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.15)] w-full max-w-md space-y-6 relative z-10 border border-cyan-500/30">
        <div className="text-center mb-8">
          <div className="inline-block px-3 py-1 border border-cyan-500/30 rounded-full text-cyan-400 text-[10px] tracking-widest mb-3 uppercase bg-cyan-500/10">
            {t.new_node}
          </div>
          <h1 className="text-3xl font-black text-cyan-100 tracking-widest uppercase">{t.reg_title}</h1>
        </div>
        
        <div className="space-y-4">
          <input type="text" placeholder={t.user_label} required className="w-full p-4 bg-slate-950 border border-slate-700 rounded-lg text-cyan-100 outline-none focus:border-cyan-500" onChange={e => setForm({...form, username: e.target.value})} />
          <input type="email" placeholder={t.email_label} required className="w-full p-4 bg-slate-950 border border-slate-700 rounded-lg text-cyan-100 outline-none focus:border-cyan-500" onChange={e => setForm({...form, email: e.target.value})} />
          <input type="password" placeholder={t.pass_label} required className="w-full p-4 bg-slate-950 border border-slate-700 rounded-lg text-cyan-100 outline-none focus:border-cyan-500" onChange={e => setForm({...form, password: e.target.value})} />
        </div>
        
        {errorMsg && <p className="text-red-500 text-xs uppercase text-center border border-red-500/30 p-2 bg-red-500/10">{errorMsg}</p>}
        
        <button className="w-full bg-cyan-600/20 text-cyan-400 border border-cyan-500 p-4 rounded-lg font-bold hover:bg-cyan-500 hover:text-slate-950 transition-all uppercase tracking-widest">
          {t.btn_reg}
        </button>

        <div className="text-center pt-4">
          <Link href="/login" className="text-cyan-500 text-xs uppercase hover:text-cyan-300">{t.link_login}</Link>
        </div>
      </form>
    </div>
  );
}
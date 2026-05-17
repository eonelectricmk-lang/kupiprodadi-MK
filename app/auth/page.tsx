'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Apple, BadgeCheck, Heart, LogOut, MessageSquare, ShieldCheck, Sparkles, UserCircle2 } from 'lucide-react';
import Header from '../components/Header';
import AuthForm from '../components/AuthForm';
import { Container, Button } from '../components/ui';
import { useTheme } from '../context/ThemeContext';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const { dark } = useTheme();
  const [loggedUser, setLoggedUser] = useState<{ id?: number; name: string; email: string; avatar_url?: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try { setLoggedUser(JSON.parse(stored)); } catch { setLoggedUser(null); }
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('user');
    setLoggedUser(null);
    router.push('/');
  };

  return (
    <>
      <Header />
      <main className={dark ? 'min-h-screen bg-[#040914] text-white' : 'min-h-screen bg-slate-100 text-slate-900'}>
        <Container className="py-8">
          <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-start">
            {/* MOBILE compact registration prompt */}
            <section className="lg:hidden rounded-xl border border-[#2a3f55] bg-[#0b1727] p-4 text-center">
              <p className="text-sm leading-relaxed text-slate-300">
                Доколку сакаш да зачуваш оглас, треба да се регистрираш. Лесно е — во 2 чекори стани член на КупиПродади.
              </p>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2 text-sm font-bold text-white hover:bg-red-500 transition"
              >
                Регистрирај се
              </button>
            </section>

            {/* DESKTOP promo section */}
            <section
              className={`hidden lg:block rounded-[28px] border p-6 shadow-2xl sm:p-8 ${
                dark
                  ? 'border-[#2a3f55] bg-gradient-to-br from-[#081223] via-[#0b1423] to-[#07101c] shadow-black/20'
                  : 'border-slate-500 bg-white shadow-slate-300/40'
              }`}
            >
              <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${dark ? 'border border-[#2a3f55] bg-[#0b1727] text-slate-300' : 'border border-slate-300 bg-white text-slate-900'}`}>
                <Sparkles className="h-4 w-4 text-emerald-400" />
                Зошто да имаш сметка?
              </div>

              <div id="hero-text" className={dark ? '' : '!text-slate-950'}>
                <h1 className={`mt-4 text-3xl font-black tracking-tight sm:text-4xl ${dark ? 'text-white' : '!text-slate-950'}`}>
                  Купи и Продади побрзо.
                </h1>
                <p className={`mt-3 max-w-xl text-sm leading-6 sm:text-base ${dark ? 'text-slate-300' : '!text-slate-800'}`}>
                  Со сметка на kupiprodadi ги зачувуваш омилените огласи, им праќаш пораки на продавачите и ги следиш твоите објави на едно место.
                </p>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className={`rounded-2xl border p-4 ${dark ? 'border-[#2a3f55] bg-[#0b1727]' : 'border-slate-400 bg-white text-slate-900 shadow-sm'}`}>
                  <Heart className="h-5 w-5 text-pink-400" />
                  <p className={`mt-2 text-sm font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>Фаворити</p>
                  <p className={`mt-1 text-xs ${dark ? 'text-slate-400' : 'text-slate-600'}`}>Зачувај огласи за подоцна.</p>
                </div>
                <div className={`rounded-2xl border p-4 ${dark ? 'border-[#2a3f55] bg-[#0b1727]' : 'border-slate-400 bg-white text-slate-900 shadow-sm'}`}>
                  <MessageSquare className="h-5 w-5 text-sky-400" />
                  <p className={`mt-2 text-sm font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>Пораки</p>
                  <p className={`mt-1 text-xs ${dark ? 'text-slate-400' : 'text-slate-600'}`}>Побрза комуникација со продавачи.</p>
                </div>
                <div className={`rounded-2xl border p-4 ${dark ? 'border-[#2a3f55] bg-[#0b1727]' : 'border-slate-400 bg-white text-slate-900 shadow-sm'}`}>
                  <BadgeCheck className="h-5 w-5 text-emerald-400" />
                  <p className={`mt-2 text-sm font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>Профил</p>
                  <p className={`mt-1 text-xs ${dark ? 'text-slate-400' : 'text-slate-600'}`}>Повеќе доверба и подобра продажба.</p>
                </div>
              </div>

              <div className={`mt-6 rounded-2xl border p-4 text-sm ${dark ? 'border-[#2a3f55] bg-black/20 text-slate-300' : 'border-slate-400 bg-slate-50 text-slate-900 shadow-sm'}`}>
                <p>Една сметка, побрз пристап и поуредно искуство додека пребаруваш низ огласи.</p>
              </div>
            </section>

            <section className={`overflow-hidden rounded-[28px] border shadow-2xl lg:mt-2 ${dark ? 'border-[#2a3f55] bg-[#0b1423] shadow-black/20' : 'border-slate-500 bg-white shadow-slate-300/40'}`}>
              {loggedUser ? (
                <div className="p-8">
                  <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${dark ? 'border border-[#2a3f55] bg-[#0b1727] text-slate-300' : 'border border-slate-300 bg-white text-slate-900'}`}>
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    Најавен профил
                  </div>
                  <div className="mt-6 flex flex-col items-center text-center">
                    {loggedUser.avatar_url ? (
                      <img src={loggedUser.avatar_url} alt="" className="h-20 w-20 rounded-full object-cover border-2 border-[#2a3f55]" />
                    ) : (
                      <UserCircle2 className="h-20 w-20 text-slate-400" />
                    )}
                    <h2 className={`mt-4 text-2xl font-black tracking-tight sm:text-3xl ${dark ? 'text-white' : 'text-slate-900'}`}>
                      {loggedUser.name}
                    </h2>
                    {loggedUser.id && (
                      <span className="mt-1 inline-flex items-center rounded-full border-2 border-blue-400/50 bg-blue-500/20 px-3 py-0.5 text-xs font-bold text-blue-300">
                        IDP: {loggedUser.id}
                      </span>
                    )}
                    <p className={`mt-2 text-sm ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {loggedUser.email}
                    </p>
                    <p className={`mt-2 text-sm font-medium ${dark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                      Веќе сте најавени
                    </p>
                    <div className="mt-6 flex w-full flex-col gap-3">
                      <Button onClick={() => router.push('/profile')} className="w-full rounded-xl bg-cyan-700 py-3 text-sm font-bold text-white hover:bg-cyan-600">
                        Оди на профил
                      </Button>
                      <button onClick={logout} className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${dark ? 'border-red-700 bg-red-700/20 text-white hover:bg-red-700/40' : 'border-red-600 bg-red-600 text-white hover:bg-red-700'}`}>
                        <LogOut className="h-4 w-4" /> Одјави се
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className={`border-b px-5 py-4 sm:px-8 ${dark ? 'border-[#2a3f55] bg-[#08101c]' : 'border-slate-500 bg-white'}`}>
                    <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${dark ? 'border border-[#2a3f55] bg-[#0b1727] text-slate-300' : 'border border-slate-300 bg-white text-slate-900'}`}>
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                      Брз и безбеден пристап
                    </div>
                    <h2 className={`mt-4 text-2xl font-black tracking-tight sm:text-3xl ${dark ? 'text-white' : 'text-slate-900'}`}>
                      {isLogin ? 'Најави се' : 'Регистрирај се'}
                    </h2>
                    <p className={`mt-2 text-sm leading-6 ${dark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Пристапи до сметката со една од опциите подолу или со е-пошта.
                    </p>
                  </div>

                  <div className="px-5 py-5 sm:px-8 sm:py-6">
                    <div className="grid gap-3">
                      <button
                        type="button"
                        className="inline-flex items-center justify-center gap-3 rounded-2xl border border-slate-500 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                      >
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#ea4335] text-[11px] font-black leading-none text-white">
                          G
                        </span>
                        Продолжи со Google
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center gap-3 rounded-2xl border border-slate-500 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                      >
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1877F2] text-[12px] font-black leading-none text-white">
                          f
                        </span>
                        Продолжи со Facebook
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center gap-3 rounded-2xl border border-slate-500 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                      >
                        <Apple className="h-5 w-5 text-slate-900" />
                        Продолжи со Apple
                      </button>
                    </div>

                    <div className="my-6 flex items-center gap-4">
                      <div className="h-px flex-1 bg-[#223653]" />
                      <span className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">или</span>
                      <div className="h-px flex-1 bg-[#223653]" />
                    </div>

                    <div className={`mb-4 grid grid-cols-2 rounded-2xl border p-1 ${dark ? 'border-[#2a3f55] bg-[#081223]' : 'border-slate-400 bg-slate-50'}`}>
                      <button
                        type="button"
                        onClick={() => setIsLogin(true)}
                        className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                          isLogin
                            ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                            : dark
                              ? 'text-slate-300 hover:text-white'
                              : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        Најава
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsLogin(false)}
                        className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                          !isLogin
                            ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                            : dark
                              ? 'text-slate-300 hover:text-white'
                              : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        Регистрација
                      </button>
                    </div>

                    <AuthForm type={isLogin ? 'login' : 'register'} />

                    <div className={`mt-6 text-center text-xs leading-5 ${dark ? 'text-slate-500' : 'text-slate-600'}`}>
                      <p>
                        Со создавање сметка се согласуваш со нашите{' '}
                        <Link href="/za-nas" className={`font-medium ${dark ? 'text-slate-300 hover:text-white' : 'text-slate-800 hover:text-slate-900'}`}>
                          Услови за користење
                        </Link>
                        .
                      </p>
                    </div>
                  </div>
                </>
              )}
            </section>
          </div>
        </Container>
      </main>
    </>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Apple, BadgeCheck, Heart, MessageSquare, ShieldCheck, Sparkles } from 'lucide-react';
import Header from '../components/Header';
import AuthForm from '../components/AuthForm';
import { Container } from '../components/ui';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#040914] text-white">
        <Container className="py-8">
          <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-start">
            <section className="rounded-[28px] border border-[#1d2c43] bg-gradient-to-br from-[#081223] via-[#0b1423] to-[#07101c] p-6 shadow-2xl shadow-black/20 sm:p-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#223653] bg-[#0b1727] px-3 py-1 text-xs font-semibold text-slate-300">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                Зошто да имаш сметка?
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                Купи и Продади побрзо.
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Со сметка на kupiprodadi ги зачувуваш омилените огласи, им праќаш пораки на продавачите и ги следиш твоите објави на едно место.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-[#1f3047] bg-[#0b1727] p-4">
                  <Heart className="h-5 w-5 text-pink-400" />
                  <p className="mt-2 text-sm font-semibold">Фаворити</p>
                  <p className="mt-1 text-xs text-slate-400">Зачувај огласи за подоцна.</p>
                </div>
                <div className="rounded-2xl border border-[#1f3047] bg-[#0b1727] p-4">
                  <MessageSquare className="h-5 w-5 text-sky-400" />
                  <p className="mt-2 text-sm font-semibold">Пораки</p>
                  <p className="mt-1 text-xs text-slate-400">Побрза комуникација со продавачи.</p>
                </div>
                <div className="rounded-2xl border border-[#1f3047] bg-[#0b1727] p-4">
                  <BadgeCheck className="h-5 w-5 text-emerald-400" />
                  <p className="mt-2 text-sm font-semibold">Профил</p>
                  <p className="mt-1 text-xs text-slate-400">Повеќе доверба и подобра продажба.</p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-[#1f3047] bg-black/20 p-4 text-sm text-slate-300">
                <p>Една сметка, побрз пристап и поуредно искуство додека пребаруваш низ огласи.</p>
              </div>
            </section>

            <section className="overflow-hidden rounded-[28px] border border-[#1d2c43] bg-[#0b1423] shadow-2xl shadow-black/20 lg:mt-2">
              <div className="border-b border-[#1d2c43] bg-[#08101c] px-5 py-4 sm:px-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#223653] bg-[#0b1727] px-3 py-1 text-xs font-semibold text-slate-300">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Брз и безбеден пристап
                </div>
                <h2 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">
                  {isLogin ? 'Најави се' : 'Регистрирај се'}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Пристапи до сметката со една од опциите подолу или со е-пошта.
                </p>
              </div>

              <div className="px-5 py-5 sm:px-8 sm:py-6">
                <div className="grid gap-3">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-3 rounded-2xl border border-[#223653] bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#ea4335] text-[11px] font-black leading-none text-white">
                      G
                    </span>
                    Продолжи со Google
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-3 rounded-2xl border border-[#223653] bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1877F2] text-[12px] font-black leading-none text-white">
                      f
                    </span>
                    Продолжи со Facebook
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center gap-3 rounded-2xl border border-[#223653] bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
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

                <div className="mb-4 grid grid-cols-2 rounded-2xl border border-[#1d2c43] bg-[#081223] p-1">
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      isLogin ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Најава
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      !isLogin ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    Регистрација
                  </button>
                </div>

                <AuthForm type={isLogin ? 'login' : 'register'} />

                <div className="mt-6 text-center text-xs leading-5 text-slate-500">
                  <p>
                    Со создавање сметка се согласуваш со нашите{' '}
                    <Link href="/za-nas" className="font-medium text-slate-300 hover:text-white">
                      Услови за користење
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </section>
          </div>
        </Container>
      </main>
    </>
  );
}

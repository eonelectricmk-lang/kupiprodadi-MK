'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Header from '@/app/components/Header';
import { Container } from '@/app/components/ui';
import { ChevronDown, Mail, MessageSquare, Phone, Send, ShieldCheck, User } from 'lucide-react';

const SUBJECTS = [
  'Одбери тема',
  'Прашање за оглас',
  'Пријава на корисник',
  'Технички проблем',
  'Предлог за нова категорија',
  'Сугестија или препорака',
  'Забелешка за платформата',
  'Плаќање и промоција',
  'Соработка и рекламирање',
  'Пријави проблем',
  'Друго',
];

type StoredUser = {
  id?: number;
  name?: string;
  email?: string;
  phone?: string;
};

export default function MessagesPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: SUBJECTS[0],
    message: '',
  });

  const a = 6;
  const b = 4;

  useEffect(() => {
    try {
      const rawUser = localStorage.getItem('user');
      if (!rawUser) return;
      const user = JSON.parse(rawUser) as StoredUser;
      setForm((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    } catch {}
  }, []);

  const helperLinks = useMemo(
    () => [
      { href: '/pravila', label: 'Правила за огласување' },
      { href: '/bezbedan-pazar', label: 'Тргувај безбедно' },
      { href: '/kako-da-objavam', label: 'Како да објавам оглас' },
      { href: '/auth', label: 'Најава и регистрација' },
    ],
    [],
  );

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (Number(captcha) !== a + b) {
      setError('Погрешен резултат. Обиди се повторно.');
      return;
    }

    if (form.subject === SUBJECTS[0]) {
      setError('Одбери тема на пораката.');
      return;
    }

    setLoading(true);

    try {
      const rawUser = localStorage.getItem('user');
      const user = rawUser ? (JSON.parse(rawUser) as StoredUser) : null;

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id ?? null,
          ...form,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Грешка при испраќање порака.');
        return;
      }

      setSent(true);
      setForm((prev) => ({
        ...prev,
        subject: SUBJECTS[0],
        message: '',
      }));
      setCaptcha('');
    } catch {
      setError('Грешка при конекција. Обиди се повторно.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#050b17] py-12 text-white">
        <Container>
          <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.92fr_1.08fr]">
            <section className="rounded-[28px] border border-[#1d2c43] bg-gradient-to-br from-[#081223] via-[#0b1423] to-[#07101c] p-6 shadow-2xl shadow-black/20 sm:p-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#223653] bg-[#0b1727] px-3 py-1 text-xs font-semibold text-slate-300">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Контактирај го админот
              </div>

              <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Тука сме да помогнеме.</h1>
              <p className="mt-3 text-sm leading-7 text-slate-300 sm:text-base">
                Ако имаш прашање, забелешка, сугестија, предлог за нова категорија, интерес за соработка или технички проблем, прати ни порака и ќе ти одговориме што е можно побрзо.
              </p>

              <div className="mt-6 space-y-3 rounded-2xl border border-[#1f3047] bg-[#0b1727] p-5">
                <p className="text-sm font-semibold text-white">Најчести причини за контакт</p>
                <ul className="space-y-2 text-sm leading-6 text-slate-400">
                  <li>• Пријава на сомнителен оглас или корисник</li>
                  <li>• Технички проблем при објава или најава</li>
                  <li>• Прашање за промоција, банер или истакнат оглас</li>
                  <li>• Предлог за нова категорија или подобрување</li>
                  <li>• Сугестија, препорака или забелешка за KupiProdadi</li>
                  <li>• Помош околу купување, продавање или соработка</li>
                </ul>
              </div>

              <div className="mt-6 rounded-2xl border border-[#1f3047] bg-black/20 p-4">
                <p className="text-sm font-semibold text-white">Корисни линкови</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {helperLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="rounded-full border border-[#223653] bg-[#0b1727] px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-[28px] border border-[#1d2c43] bg-[#0b1423] shadow-2xl shadow-black/20">
              <div className="border-b border-[#1d2c43] bg-[#08101c] px-5 py-4 sm:px-8">
                <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Испрати порака</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Формата оди директно до администрацијата. Може да ни пишеш за огласи, категории, соработка, технички проблеми, сугестии и сè што е поврзано со KupiProdadi.
                </p>
              </div>

              <div className="px-5 py-5 sm:px-8 sm:py-6">
                {sent ? (
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-6 text-center">
                    <p className="text-xl font-bold text-emerald-300">Пораката е испратена.</p>
                    <p className="mt-2 text-sm text-slate-300">Администраторот ќе ти одговори што е можно побрзо.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {error}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-white">Име</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          name="name"
                          required
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Твоето име"
                          className="w-full rounded-xl border border-[#223653] bg-[#081223] py-3 pl-11 pr-4 text-white placeholder:text-slate-500 outline-none transition focus:border-[#2d4f7d] focus:ring-2 focus:ring-[#2d4f7d]/30"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-white">Е-пошта</label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                          <input
                            type="email"
                            name="email"
                            required
                            value={form.email}
                            onChange={handleChange}
                            placeholder="ime@primer.mk"
                            className="w-full rounded-xl border border-[#223653] bg-[#081223] py-3 pl-11 pr-4 text-white placeholder:text-slate-500 outline-none transition focus:border-[#2d4f7d] focus:ring-2 focus:ring-[#2d4f7d]/30"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-sm font-semibold text-white">Телефон</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                          <input
                            type="tel"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="+389 7x xxx xxx"
                            className="w-full rounded-xl border border-[#223653] bg-[#081223] py-3 pl-11 pr-4 text-white placeholder:text-slate-500 outline-none transition focus:border-[#2d4f7d] focus:ring-2 focus:ring-[#2d4f7d]/30"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-white">Тема</label>
                      <div className="relative">
                        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                        <select
                          name="subject"
                          value={form.subject}
                          onChange={handleChange}
                          className="w-full appearance-none rounded-xl border border-[#223653] bg-[#081223] px-4 py-3 text-white outline-none transition focus:border-[#2d4f7d] focus:ring-2 focus:ring-[#2d4f7d]/30"
                        >
                          {SUBJECTS.map((subject) => (
                            <option key={subject} value={subject} disabled={subject === SUBJECTS[0]}>
                              {subject}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-white">Порака</label>
                      <div className="relative">
                        <MessageSquare className="absolute left-4 top-4 h-4 w-4 text-slate-500" />
                        <textarea
                          name="message"
                          rows={6}
                          required
                          value={form.message}
                          onChange={handleChange}
                          placeholder="Опиши го проблемот или прашањето што е можно појасно..."
                          className="w-full resize-none rounded-xl border border-[#223653] bg-[#081223] py-3 pl-11 pr-4 text-white placeholder:text-slate-500 outline-none transition focus:border-[#2d4f7d] focus:ring-2 focus:ring-[#2d4f7d]/30"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-white">
                        Безбедносна проверка: <span className="font-bold text-emerald-300">{a} + {b} = ?</span>
                      </label>
                      <input
                        type="number"
                        value={captcha}
                        onChange={(e) => setCaptcha(e.target.value)}
                        required
                        placeholder="Внеси го резултатот"
                        className="w-40 rounded-xl border border-[#223653] bg-[#081223] px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-[#2d4f7d] focus:ring-2 focus:ring-[#2d4f7d]/30"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <Send className="h-4 w-4" />
                      {loading ? 'Се испраќа...' : 'Испрати порака'}
                    </button>
                  </form>
                )}
              </div>
            </section>
          </div>
        </Container>
      </main>
    </>
  );
}

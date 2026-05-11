'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Globe, Mail, MessageCircle, Phone, Send } from 'lucide-react';
import { CATEGORIES } from '@/lib/categories';

export default function Footer() {
  const [categories, setCategories] = useState(CATEGORIES);

  const contactPhoneDisplay = '+389 70 227 677';
  const contactPhoneHref = 'tel:+38970227677';
  const websiteUrl = 'https://www.kupiprodadi.mk';
  const socialLinks = [
    { label: 'Facebook', href: 'https://facebook.com/kupiprodadi.mk' },
    { label: 'Instagram', href: 'https://instagram.com/kupiprodadi.mk' },
    { label: 'TikTok', href: 'https://tiktok.com/@kupiprodadi.mk' },
    { label: 'Viber', href: 'viber://chat?number=%2B38970227677' },
    { label: 'Telegram', href: 'https://t.me/+38970227677' },
    { label: 'WhatsApp', href: 'https://wa.me/38970227677' },
  ];

  const footerGroupSlug = (slug: string) => {
    if (slug === 'motorni-vozila') return 'avtomobili';
    return slug.replace(/-/g, '');
  };

  useEffect(() => {
    fetch('/api/categories')
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data?.categories) && data.categories.length) {
          setCategories(data.categories);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="bg-[#050c16] border-t border-[#172334] text-slate-400 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-5 mb-10">

          {/* Лого + Опис */}
          <div className="xl:col-span-2">
            <Link href="/">
              <span className="text-2xl font-extrabold text-white">kupi</span>
              <span className="text-2xl font-extrabold text-red-500">prodadi</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed">
              Македонска платформа за купување и продавање. Безбедно, брзо и бесплатно.
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <a href={websiteUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white transition">
                <Globe className="h-4 w-4" />
                <span>www.kupiprodadi.mk</span>
              </a>
              <Link href="/messages" className="flex items-center gap-2 hover:text-white transition">
                <Mail className="h-4 w-4" />
                <span>Прати порака до админ</span>
              </Link>
              <a href={contactPhoneHref} className="flex items-center gap-2 hover:text-white transition">
                <Phone className="h-4 w-4" />
                <span>Добиј нè на директна линија и прашај: {contactPhoneDisplay}</span>
              </a>
            </div>
            <div className="flex gap-3 mt-4">
              <a href={websiteUrl} target="_blank" rel="noreferrer" className="hover:text-white transition" aria-label="Website"><Globe className="h-5 w-5" /></a>
              <Link href="/messages" className="hover:text-white transition" aria-label="Контакт форма"><Mail className="h-5 w-5" /></Link>
              <a href={contactPhoneHref} className="hover:text-white transition" aria-label="Телефон"><Phone className="h-5 w-5" /></a>
            </div>
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Социјални мрежи и канали</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a href={socialLinks[0].href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-[#223653] bg-[#0b1727] px-3 py-1.5 text-xs text-slate-200 hover:text-white transition">
                  <span className="text-[10px] font-black uppercase">fb</span>
                  Facebook
                </a>
                <a href={socialLinks[1].href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-[#223653] bg-[#0b1727] px-3 py-1.5 text-xs text-slate-200 hover:text-white transition">
                  <span className="text-[10px] font-black uppercase">ig</span>
                  Instagram
                </a>
                <a href={socialLinks[2].href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-[#223653] bg-[#0b1727] px-3 py-1.5 text-xs text-slate-200 hover:text-white transition">
                  <MessageCircle className="h-3.5 w-3.5" />
                  TikTok
                </a>
                <a href={socialLinks[3].href} className="inline-flex items-center gap-2 rounded-full border border-[#223653] bg-[#0b1727] px-3 py-1.5 text-xs text-slate-200 hover:text-white transition">
                  <Phone className="h-3.5 w-3.5" />
                  Viber
                </a>
                <a href={socialLinks[4].href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-[#223653] bg-[#0b1727] px-3 py-1.5 text-xs text-slate-200 hover:text-white transition">
                  <Send className="h-3.5 w-3.5" />
                  Telegram
                </a>
                <a href={socialLinks[5].href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-[#223653] bg-[#0b1727] px-3 py-1.5 text-xs text-slate-200 hover:text-white transition">
                  <MessageCircle className="h-3.5 w-3.5" />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* Помош */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Помош</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/kako-da-objavam" className="hover:text-white transition">Како да објавам оглас</Link></li>
              <li><Link href="/pravila" className="hover:text-white transition">Правила за огласување</Link></li>
              <li><Link href="/bezbedan-pazar" className="hover:text-white transition">Тргувај безбедно</Link></li>
              <li><Link href="/messages" className="hover:text-white transition">Контактирајте не</Link></li>
              <li><Link href="/messages" className="hover:text-white transition">Пријави проблем</Link></li>
            </ul>
          </div>

          {/* Информации */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Информации</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/za-nas" className="hover:text-white transition">За КупиПродади</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition">Политика за приватност</Link></li>
              <li><Link href="/privacy#kolacinja" className="hover:text-white transition">Политика за колачиња</Link></li>
              <li><Link href="/admin" className="hover:text-white transition">Банери и рекламирање</Link></li>
              <li><Link href="/sell" className="hover:text-white transition">Придобивки за продавачи</Link></li>
            </ul>
          </div>

          {/* Категории */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Категории</h3>
            <ul className="space-y-2 text-sm">
              {categories.slice(0, 5).map((category) => (
                <li key={category.slug}>
                  <Link href={`/categories/${category.slug}`} className="hover:text-white transition">
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Facebook групи</h3>
            <ul className="space-y-2 text-sm">
              {categories.slice(0, 5).map((category) => (
                <li key={`${category.slug}-group`}>
                  <a
                    href={`https://fb.com/kupiprodadi.${footerGroupSlug(category.slug)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition"
                  >
                    {category.name}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-slate-500">
              Почетна поставка за категoриски групи, според истата шема за сите главни категории.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#172334] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p>© 2026 КупиПродади. Сите права задржани.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition">Приватност</Link>
            <Link href="/pravila" className="hover:text-white transition">Правила</Link>
            <Link href="/messages" className="hover:text-white transition">Контакт</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

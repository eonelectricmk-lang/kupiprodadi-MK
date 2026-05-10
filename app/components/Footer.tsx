import Link from 'next/link';
import { Globe, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#050c16] border-t border-[#172334] text-slate-400 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">

          {/* Лого + Опис */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/">
              <span className="text-2xl font-extrabold text-white">куpi</span>
              <span className="text-2xl font-extrabold text-red-500">продади</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed">
              Македонска платформа за купување и продавање. Безбедно, брзо и бесплатно.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="hover:text-white transition"><Globe className="h-5 w-5" /></a>
              <a href="#" className="hover:text-white transition"><Mail className="h-5 w-5" /></a>
              <a href="#" className="hover:text-white transition"><Phone className="h-5 w-5" /></a>
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
              <li><Link href="/products?category=motorni-vozila" className="hover:text-white transition">Моторни возила</Link></li>
              <li><Link href="/products?category=nedvoznosti" className="hover:text-white transition">Недвижности</Link></li>
              <li><Link href="/products?category=mobilni-telefoni" className="hover:text-white transition">Мобилни телефони</Link></li>
              <li><Link href="/products?category=kompjuteri" className="hover:text-white transition">Компјутери</Link></li>
              <li><Link href="/products?category=dom-gradina" className="hover:text-white transition">Дом и градина</Link></li>
            </ul>
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

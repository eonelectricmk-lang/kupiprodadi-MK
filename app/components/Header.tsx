'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Container } from './ui';
import { CATEGORIES } from '@/lib/categories';
import {
  Bell, ChevronDown, Heart, LayoutGrid, MapPin,
  Search, Shirt, Smartphone, Car, House, Sofa,
  UserCircle, Sun, Moon,
} from 'lucide-react';
import { getCategoryIconMeta } from './categoryIcons';
import { useTheme } from '@/app/context/ThemeContext';

const MACEDONIAN_CITIES = [
  'Целa Македонија', 'Скопје', 'Прилеп', 'Битола', 'Охрид',
  'Куманово', 'Велес', 'Штип', 'Гевгелија', 'Кавадарци',
  'Кичево', 'Коцани', 'Крива Паланка', 'Ресен', 'Берово',
];

const NAV_CATEGORIES = [
  { slug: 'motorni-vozila', name: 'Моторни возила', icon: Car, iconColor: 'text-red-400' },
  { slug: 'nedviznosti', name: 'Недвижности', icon: House, iconColor: 'text-emerald-400' },
  { slug: 'dom-i-gradina', name: 'Дом и градина', icon: Sofa, iconColor: 'text-amber-400' },
  { slug: 'moda', name: 'Мода и убавина', icon: Shirt, iconColor: 'text-pink-400' },
  { slug: 'mobilni-telefoni', name: 'Мобилни телефони', icon: Smartphone, iconColor: 'text-violet-400' },
];

export function Header() {
  const router = useRouter();
  const { dark, setDark } = useTheme();
  const [categories, setCategories] = useState(CATEGORIES);
  const [location, setLocation] = useState('Целa Македонија');
  const [showLocation, setShowLocation] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [search, setSearch] = useState('');

  const h = dark ? {
    header: 'bg-[#07101c]/95 border-[#172334]',
    search: 'bg-[#0b1727] border-[#1f3047]',
    searchInput: 'text-gray-100 placeholder-gray-500',
    searchIcon: 'text-gray-400',
    location: 'bg-[#0b1727] border-[#1f3047] text-gray-200',
    locationDropdown: 'bg-[#0f1b2b] border-[#1f3047]',
    locationItem: 'text-gray-200 hover:bg-[#14243a]',
    icon: 'text-gray-400 hover:text-white',
    navBar: 'bg-[#050c16] border-[#172334]',
    allCats: 'bg-[#121f33] hover:bg-[#1a2d49] text-white border-2 border-white/10',
    navCat: 'bg-[#0f1a2b] text-gray-300 hover:text-white hover:bg-[#16263d] border-2 border-white/10',
    more: 'text-gray-400 hover:text-white',
    dropdown: 'bg-[#0d1727] border-[#1f3047]',
    subText: 'text-gray-300 hover:text-white',
    logo: 'text-white',
  } : {
    header: 'bg-white/95 border-gray-200',
    search: 'bg-gray-100 border-gray-300',
    searchInput: 'text-gray-900 placeholder-gray-400',
    searchIcon: 'text-gray-700',
    location: 'bg-gray-100 border-gray-300 text-gray-900',
    locationDropdown: 'bg-white border-gray-200',
    locationItem: 'text-gray-900 hover:bg-gray-100',
    icon: 'text-gray-700 hover:text-gray-900',
    navBar: 'bg-gray-50 border-gray-200',
    allCats: 'bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200',
    navCat: 'bg-white text-gray-900 hover:text-gray-900 hover:bg-gray-50 border-2 border-gray-200',
    more: 'text-gray-700 hover:text-gray-900',
    dropdown: 'bg-white border-gray-200',
    subText: 'text-gray-700 hover:text-gray-900',
    logo: 'text-gray-900',
  };

  const colors = [
    'bg-blue-600','bg-emerald-600','bg-orange-500','bg-purple-600','bg-pink-500',
    'bg-sky-500','bg-indigo-600','bg-teal-600','bg-rose-500','bg-amber-500',
    'bg-cyan-600','bg-lime-600','bg-violet-600','bg-fuchsia-600','bg-red-500',
    'bg-green-600','bg-yellow-500','bg-blue-500','bg-emerald-500','bg-purple-500',
  ];

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

  const navCategoryLookup = new Map(NAV_CATEGORIES.map((category) => [category.slug, category]));
  const navCategories = categories.slice(0, 5).map((category) => {
    const navMeta = navCategoryLookup.get(category.slug);
    return {
      slug: category.slug,
      name: navMeta?.name || category.name,
      iconMeta: getCategoryIconMeta(category.slug),
    };
  });

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) {
      params.set('search', search.trim());
    }
    if (location && location !== 'Целa Македонија') {
      params.set('location', location);
    }
    router.push(`/products${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <header className={`sticky top-0 z-50 backdrop-blur transition-colors duration-300 ${h.header}`}>
      <Container>
        <div className="py-3 flex items-center justify-between gap-4">
          <Link href="/" className="flex-shrink-0 hover:opacity-90 transition ml-2">
            <span className={`text-4xl font-extrabold tracking-tight ${h.logo}`}>kupi</span>
            <span className="text-4xl font-extrabold text-red-500 tracking-tight">prodadi</span>
          </Link>

          <form onSubmit={submitSearch} className={`hidden md:flex flex-1 max-w-xl items-center border-2 rounded-lg overflow-hidden focus-within:border-blue-400 ${h.search}`}>
            <span className={`pl-3 text-sm ${h.searchIcon}`}><Search className="h-4 w-4" /></span>
            <input
              type="text"
              placeholder="Пребарај огласи..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`flex-1 px-3 py-2.5 text-sm focus:outline-none bg-transparent ${h.searchInput}`}
            />
            <button type="submit" className="sr-only">Пребарај</button>
          </form>

          <div className="relative flex-shrink-0 hidden lg:block">
            <button
              onClick={() => setShowLocation(!showLocation)}
              className={`flex items-center gap-1.5 px-3 py-2.5 border rounded-lg text-sm font-medium hover:border-blue-400 transition ${h.location}`}
            >
              <MapPin className="h-4 w-4" />
              <span className="whitespace-nowrap">{location}</span>
              <ChevronDown className="h-4 w-4" />
            </button>
            {showLocation && (
              <div className={`absolute top-full right-0 mt-1 border rounded-lg shadow-xl z-50 w-48 max-h-60 overflow-y-auto ${h.locationDropdown}`}>
                {MACEDONIAN_CITIES.map(city => (
                  <button
                    key={city}
                    onClick={() => { setLocation(city); setShowLocation(false); }}
                    className={`w-full text-left px-4 py-2 text-sm ${h.locationItem}`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <button onClick={() => setDark(!dark)} className={`transition ${h.icon}`} title={dark ? 'Светла тема' : 'Темна тема'}>
              {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <Link href="/favorites">
              <button className={`transition ${h.icon}`}><Heart className="h-5 w-5" /></button>
            </Link>
            <Link href="/messages">
              <div className="relative">
                <button className={`transition ${h.icon}`}><Bell className="h-5 w-5" /></button>
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">3</span>
              </div>
            </Link>
            <Link href="/auth">
              <button className={`transition ${h.icon}`}><UserCircle className="h-5 w-5" /></button>
            </Link>
            <Link href="/sell">
              <button className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg text-sm transition whitespace-nowrap">
                + Објави оглас
              </button>
            </Link>
          </div>
        </div>
      </Container>

      <div className={`transition-colors duration-300 ${h.navBar}`}>
        <Container>
          <div className="flex items-center gap-2.5 overflow-x-auto py-2 no-scrollbar">
            <button
              onClick={() => setShowCategories(!showCategories)}
              className={`shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition ${h.allCats}`}
            >
              <LayoutGrid className="h-4 w-4" />
              Сите категории
              <ChevronDown className="h-4 w-4" />
            </button>

            {navCategories.map(cat => (
              <Link key={cat.slug} href={`/products?category=${cat.slug}`}>
                <button className={`shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm whitespace-nowrap transition ${h.navCat}`}>
                  <cat.iconMeta.Icon className={`h-4 w-4 ${cat.iconMeta.className}`} />
                  {cat.name}
                </button>
              </Link>
            ))}


          </div>
        </Container>

        {showCategories && (
          <div className={`absolute left-0 right-0 border-t shadow-2xl z-40 max-h-[70vh] overflow-y-auto ${h.dropdown}`}>
            <Container>
              <div className="grid grid-cols-4 gap-4 py-5">
                {categories.map((category, i) => {
                  const { Icon, className } = getCategoryIconMeta(category.slug);
                  return (
                    <div key={category.slug}>
                      <Link href={`/products?category=${category.slug}`}>
                        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-sm font-bold mb-2 cursor-pointer transition ${colors[i % colors.length]}`} style={{ color: '#fff' }}>
                          <Icon className={`h-4 w-4 ${className}`} /> {category.name}
                        </div>
                      </Link>
                      <div className="pl-1 space-y-0.5">
                        {category.subcategories.map(sub => (
                          <Link key={sub.slug} href={`/products?category=${category.slug}&sub=${sub.slug}`}>
                            <div className={`text-xs hover:underline py-0.5 cursor-pointer ${h.subText}`}>
                              • {sub.name}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Container>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;

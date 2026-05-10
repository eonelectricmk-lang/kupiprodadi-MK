'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  Car,
  Dumbbell,
  House,
  Laptop,
  Shirt,
  Smartphone,
  Sofa,
} from 'lucide-react';
import Header from './components/Header';
import CategoryCard from './components/CategoryCard';
import AdCard from './components/AdCard';
import TrustBar from './components/TrustBar';
import { HOME_CATEGORIES } from './data/categories';
import { DEFAULT_BANNERS } from '@/lib/banner-store';

const ADS = [
  { id: 1, title: 'iPhone 15 Pro Max', price: 1200, location: 'Скопје', image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&h=350&fit=crop', badge: 'НОВО', currency: '€', isVerified: true, category: 'mobilni-telefoni' },
  { id: 2, title: 'MacBook Pro 16"', price: 2400, location: 'Охрид', image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=350&fit=crop', currency: '€', isVerified: true, category: 'kompjuteri' },
  { id: 3, title: 'Audi A4 2.0 TDI', price: 8500, location: 'Битола', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=500&h=350&fit=crop', badge: 'ТОП', currency: '€', category: 'motorni-vozila' },
  { id: 4, title: 'Стан 80м² во центар', price: 72000, location: 'Прилеп', image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=350&fit=crop', currency: '€', isVerified: true, category: 'nedvoznosti' },
  { id: 5, title: 'Trek Domane AL 2', price: 850, location: 'Тетово', image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500&h=350&fit=crop', currency: '€', isVerified: true, category: 'sportska-oprema' },
  { id: 6, title: 'Двосед кауч', price: 220, location: 'Куманово', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=350&fit=crop', currency: '€', category: 'dom-gradina' },
  { id: 7, title: 'Samsung Galaxy S24 Ultra', price: 980, location: 'Скопје', image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&h=350&fit=crop', currency: '€', isVerified: true, category: 'mobilni-telefoni' },
  { id: 8, title: 'Dell XPS 15 OLED', price: 1650, location: 'Струмица', image: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=500&h=350&fit=crop', badge: 'НОВО', currency: '€', category: 'kompjuteri' },
  { id: 9, title: 'BMW 320d M Sport', price: 14900, location: 'Штип', image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=500&h=350&fit=crop', currency: '€', isVerified: true, category: 'motorni-vozila' },
  { id: 10, title: 'Куќа 140м² со двор', price: 98000, location: 'Кавадарци', image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=500&h=350&fit=crop', currency: '€', category: 'nedvoznosti' },
  { id: 11, title: 'Орбитрек + тегови сет', price: 320, location: 'Гостивар', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=350&fit=crop', currency: '€', category: 'sportska-oprema' },
  { id: 12, title: 'Трпезариска маса + 6 столици', price: 390, location: 'Велес', image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=500&h=350&fit=crop', currency: '€', category: 'dom-gradina' },
  { id: 13, title: 'iPad Pro M4 11"', price: 940, location: 'Охрид', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&h=350&fit=crop', badge: 'ТОП', currency: '€', category: 'mobilni-telefoni' },
  { id: 14, title: 'GeForce RTX 4080 Gaming', price: 1200, location: 'Скопје', image: 'https://images.unsplash.com/photo-1591489378430-ef2f4c626b35?w=500&h=350&fit=crop', currency: '€', category: 'kompjuteri' },
  { id: 15, title: 'VW Golf 7 1.6 TDI', price: 9200, location: 'Кочани', image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=500&h=350&fit=crop', currency: '€', category: 'motorni-vozila' },
  { id: 16, title: 'Деловен простор 60м²', price: 54000, location: 'Битола', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&h=350&fit=crop', currency: '€', isVerified: true, category: 'nedvoznosti' },
  { id: 17, title: 'Планински велосипед Scott', price: 680, location: 'Тетово', image: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=500&h=350&fit=crop', currency: '€', category: 'sportska-oprema' },
  { id: 18, title: 'Аголна гарнитура во кожа', price: 520, location: 'Прилеп', image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=500&h=350&fit=crop', currency: '€', category: 'dom-gradina' },
  { id: 19, title: 'Xiaomi 14 Pro 512GB', price: 760, location: 'Куманово', image: 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=500&h=350&fit=crop', currency: '€', category: 'mobilni-telefoni' },
  { id: 20, title: 'Apple Watch Ultra 2', price: 690, location: 'Скопје', image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500&h=350&fit=crop', badge: 'НОВО', currency: '€', category: 'mobilni-telefoni' },
  { id: 21, title: 'Mercedes C220 CDI', price: 13200, location: 'Струга', image: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=500&h=350&fit=crop', currency: '€', category: 'motorni-vozila' },
  { id: 22, title: 'Стан 55м² во Аеродром', price: 63500, location: 'Скопје', image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&h=350&fit=crop', currency: '€', isVerified: true, category: 'nedvoznosti' },
  { id: 23, title: 'Gaming сетап комплет', price: 2100, location: 'Гевгелија', image: 'https://images.unsplash.com/photo-1586899028174-e7098604235b?w=500&h=350&fit=crop', currency: '€', category: 'kompjuteri' },
  { id: 24, title: 'Терасна маса + 4 столици', price: 260, location: 'Ресен', image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=500&h=350&fit=crop', currency: '€', category: 'dom-gradina' },
];

type BannerSlide = {
  id?: number;
  image_url: string;
  link_url?: string | null;
};

const CATEGORY_ICONS = {
  car: Car,
  home: House,
  phone: Smartphone,
  computer: Laptop,
  sofa: Sofa,
  shirt: Shirt,
  dumbbell: Dumbbell,
  briefcase: Briefcase,
} as const;

export default function Home() {
  const [activeBanner, setActiveBanner] = useState(0);
  const [bannerSlides, setBannerSlides] = useState<BannerSlide[]>(DEFAULT_BANNERS);
  const [cardsPerRow, setCardsPerRow] = useState<6 | 4 | 2>(4);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price-asc' | 'price-desc' | 'title-asc'>('newest');

  const sortedAds = useMemo(() => {
    const next = [...ADS];

    switch (sortBy) {
      case 'oldest':
        return next.sort((a, b) => a.id - b.id);
      case 'price-asc':
        return next.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return next.sort((a, b) => b.price - a.price);
      case 'title-asc':
        return next.sort((a, b) => a.title.localeCompare(b.title, 'mk'));
      case 'newest':
      default:
        return next.sort((a, b) => b.id - a.id);
    }
  }, [sortBy]);

  const adsGridClassName = useMemo(() => {
    if (cardsPerRow === 6) {
      return 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6';
    }
    if (cardsPerRow === 2) {
      return 'grid grid-cols-1 gap-3 sm:grid-cols-2';
    }
    return 'grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4';
  }, [cardsPerRow]);

  useEffect(() => {
    fetch('/api/banners')
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data?.banners) && data.banners.length > 0) {
          setBannerSlides(data.banners);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % bannerSlides.length);
    }, 4500);

    return () => clearInterval(intervalId);
  }, [bannerSlides.length]);

  return (
    <main className="min-h-screen bg-[#040914] text-white">
      <Header />

      <section
        id="hero-banner"
        className="relative mx-auto mt-6 h-[230px] max-w-6xl overflow-hidden rounded-2xl border-2 border-[#1d2c43] md:h-[280px] px-4"
      >
        <div
          className="absolute inset-0 flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${activeBanner * 100}%)` }}
        >
          {bannerSlides.map((slide) => (
            <Link
              key={slide.id || slide.image_url}
              href={slide.link_url || '#'}
              aria-label={`Банер ${slide.id || slide.image_url}`}
              className={`relative h-full w-full shrink-0 bg-cover bg-center ${slide.link_url ? 'cursor-pointer' : 'pointer-events-none'}`}
              style={{ backgroundImage: `url('${slide.image_url}')` }}
            />
          ))}
        </div>

        <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/30 px-2 py-1 backdrop-blur-sm">
          {bannerSlides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Промени банер ${idx + 1}`}
              onClick={() => setActiveBanner(idx)}
              className={`h-1.5 rounded-full transition ${activeBanner === idx ? 'w-6 bg-white' : 'w-2 bg-white/55 hover:bg-white/80'}`}
            />
          ))}
        </div>
      </section>

      <TrustBar />

      <section className="mx-auto max-w-6xl px-4 py-3">
        <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {HOME_CATEGORIES.slice(0, 6).map((category) => {
            const Icon = CATEGORY_ICONS[category.icon];
            return (
              <CategoryCard
                key={category.slug}
                icon={Icon}
                iconClassName={category.color}
                title={category.title}
                count={category.count}
                href={`/products?category=${category.slug}`}
              />
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-8">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2.5">
          <div>
            <h2 className="text-2xl font-bold">Популарни огласи</h2>
            <div className="mt-1 h-0.5 w-16 rounded bg-red-600" />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="inline-flex items-center gap-1 rounded-lg border border-[#1f3250] bg-[#0f1a2b] p-1">
              <button
                type="button"
                aria-label="Прикажи 6 во ред"
                onClick={() => setCardsPerRow(6)}
                className={`rounded p-1 transition ${cardsPerRow === 6 ? 'bg-[#162945] text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <span className="grid grid-cols-3 gap-0.5">
                  {Array.from({ length: 6 }, (_, i) => (
                    <span key={`v6-${i}`} className="h-1.5 w-1.5 rounded-[2px] bg-current" />
                  ))}
                </span>
              </button>
              <button
                type="button"
                aria-label="Прикажи 4 во ред"
                onClick={() => setCardsPerRow(4)}
                className={`rounded p-1 transition ${cardsPerRow === 4 ? 'bg-[#162945] text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <span className="grid grid-cols-2 gap-0.5">
                  {Array.from({ length: 4 }, (_, i) => (
                    <span key={`v4-${i}`} className="h-1.5 w-1.5 rounded-[2px] bg-current" />
                  ))}
                </span>
              </button>
              <button
                type="button"
                aria-label="Прикажи 2 во ред"
                onClick={() => setCardsPerRow(2)}
                className={`rounded p-1 transition ${cardsPerRow === 2 ? 'bg-[#162945] text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <span className="grid grid-cols-1 gap-0.5">
                  {Array.from({ length: 2 }, (_, i) => (
                    <span key={`v2-${i}`} className="h-1.5 w-3 rounded-[2px] bg-current" />
                  ))}
                </span>
              </button>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'price-asc' | 'price-desc' | 'title-asc')}
              className="h-9 rounded-lg border border-[#1f3250] bg-[#0f1a2b] px-2.5 text-sm text-slate-200 outline-none transition focus:border-[#2d4f7d]"
              aria-label="Сортирај огласи"
            >
              <option value="newest">Најновите први</option>
              <option value="oldest">Најстарите први</option>
              <option value="price-asc">Најниска цена</option>
              <option value="price-desc">Највисока цена</option>
              <option value="title-asc">По име (А-Ш)</option>
            </select>

            <Link
              href="/products"
              className="group inline-flex h-9 items-center gap-1 rounded-lg border border-[#1f3250] bg-[#0f1a2b] px-3 text-sm font-semibold text-slate-200 transition hover:bg-[#14243a] hover:text-white"
            >
              Види ги сите
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>

        <div className={adsGridClassName}>
          {sortedAds.map((ad) => (
            <Link key={ad.id} href={`/products/${ad.id}?category=${encodeURIComponent(ad.category)}`}>
              <AdCard ad={ad} layout={cardsPerRow === 2 ? 'list' : 'grid'} />
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

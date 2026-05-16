'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { LayoutGrid, ChevronDown } from 'lucide-react';
import Header from './components/Header';
import CategoryCard from './components/CategoryCard';
import AdCard from './components/AdCard';
import TrustBar, { DEFAULT_TRUST_ITEMS } from './components/TrustBar';
import { CATEGORIES } from '@/lib/categories';
import { getCategoryIconMeta } from './components/categoryIcons';
import { DEFAULT_BANNERS } from '@/lib/banner-store';
import type { HomepageTrustItem } from '@/lib/homepage-sections';

type ProductCard = {
  id: number;
  title: string;
  price: number;
  currency?: string;
  description?: string;
  location?: string | null;
  city?: string | null;
  image_url?: string | null;
  images?: string[];
  seller_rating?: number;
  created_at?: string;
  category: string;
  sold_at?: string | null;
};

type BannerSlide = {
  id?: number;
  image_url: string;
  link_url?: string | null;
};

export default function Home() {
  const [activeBanner, setActiveBanner] = useState(0);
  const [bannerSlides, setBannerSlides] = useState<BannerSlide[]>(DEFAULT_BANNERS);
  const [homeCategories, setHomeCategories] = useState(CATEGORIES);
  const [homeCategorySlugs, setHomeCategorySlugs] = useState<string[]>([]);
  const [trustItems, setTrustItems] = useState<HomepageTrustItem[]>(DEFAULT_TRUST_ITEMS);
  const [featuredAds, setFeaturedAds] = useState<ProductCard[]>([]);
  const [cardsPerRow, setCardsPerRow] = useState<6 | 4 | 2>(4);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price-asc' | 'price-desc' | 'title-asc'>('newest');

  const sortedAds = useMemo(() => {
    const next = [...featuredAds];

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
  }, [featuredAds, sortBy]);

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
    fetch('/api/categories')
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data?.categories) && data.categories.length > 0) {
          setHomeCategories(data.categories);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/homepage-sections')
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data?.homeCategorySlugs)) {
          setHomeCategorySlugs(data.homeCategorySlugs);
        }
        if (Array.isArray(data?.trustItems) && data.trustItems.length) {
          setTrustItems(data.trustItems);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/products?limit=24&offset=0', { cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data?.products)) {
          setFeaturedAds(data.products);
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

  const orderedHomeCategories = useMemo(() => {
    if (!homeCategorySlugs.length) return homeCategories.slice(0, 6);
    const bySlug = new Map(homeCategories.map((category) => [category.slug, category]));
    const selected = homeCategorySlugs
      .map((slug) => bySlug.get(slug))
      .filter((category): category is typeof homeCategories[number] => Boolean(category));
    return selected.length ? selected : homeCategories.slice(0, 6);
  }, [homeCategories, homeCategorySlugs]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#040914] text-white">
      <Header />

      <div className="mx-auto max-w-6xl space-y-2.5 px-4 py-2.5">
        <section>
          <div
            id="hero-banner"
            className="relative h-[130px] overflow-hidden rounded-2xl border border-[#2a3f55] bg-[#07101c] md:h-[280px]"
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
                  className={`relative h-full w-full shrink-0 bg-contain bg-center bg-no-repeat md:bg-cover ${slide.link_url ? 'cursor-pointer' : 'pointer-events-none'}`}
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
          </div>
        </section>

        <div className="block sm:hidden">
          <div className="grid grid-cols-2 gap-1">
            <a
              href="/products"
              className="flex min-w-0 items-center gap-1 overflow-hidden rounded border-2 border-[#2a3f55] bg-[#121f33] px-2 py-1 text-[12px] font-semibold leading-none tracking-[-0.01em] text-white transition hover:bg-[#1a2d49]"
            >
              <LayoutGrid className="h-4 w-4 shrink-0" />
              <span className="min-w-0 flex-1 truncate text-left">Сите категории</span>
              <ChevronDown className="h-4 w-4 shrink-0" />
            </a>
            {orderedHomeCategories.slice(0, 3).map((category) => {
              const iconMeta = getCategoryIconMeta(category.slug);
              const Icon = iconMeta.Icon;
              return (
                <a
                  key={category.slug}
                  href={`/products?category=${category.slug}`}
                  className="flex min-w-0 items-center gap-1 overflow-hidden rounded border-2 border-[#2a3f55] bg-[#0f1a2b] px-2 py-1 text-[12px] leading-none tracking-[-0.01em] text-gray-300 transition hover:bg-[#16263d] hover:text-white"
                >
                  <Icon className={`h-4 w-4 shrink-0 ${iconMeta.className}`} />
                  <span className="min-w-0 flex-1 truncate text-left">{category.name}</span>
                </a>
              );
            })}
          </div>
        </div>

        <div className="hidden md:block"><TrustBar items={trustItems} /></div>

        <div className="hidden md:block">
        <section>
          <div className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {orderedHomeCategories.slice(0, 6).map((category) => {
              const iconMeta = getCategoryIconMeta(category.slug);
              const Icon = iconMeta.Icon;
              return (
                <CategoryCard
                  key={category.slug}
                  icon={Icon}
                  iconClassName={iconMeta.className}
                  title={category.name}
                  href={`/products?category=${category.slug}`}
                />
              );
            })}
          </div>
        </section>
        </div>

        <section className="pb-5 sm:pb-8">
        <div className="mb-3 flex flex-wrap items-end justify-start gap-2.5 sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Популарни огласи</h2>
            <div className="mt-1 h-0.5 w-16 rounded bg-red-600" />
          </div>

          <div className="ml-0 flex w-full items-center gap-2 sm:w-auto sm:ml-auto">
            <div className="inline-flex h-9 items-center gap-1 rounded-lg border border-[#1f3250] bg-[#0f1a2b] p-1">
              <button
                type="button"
                aria-label="Прикажи 6 во ред"
                onClick={() => setCardsPerRow(6)}
                className={`hidden rounded p-1 transition sm:inline-flex ${cardsPerRow === 6 ? 'bg-[#162945] text-white' : 'text-slate-400 hover:text-slate-200'}`}
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
              className="h-9 min-w-0 rounded-lg border border-[#1f3250] bg-[#0f1a2b] px-2.5 text-sm text-slate-200 outline-none transition focus:border-[#2d4f7d] max-sm:flex-1 sm:flex-none"
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
              className="group inline-flex h-9 items-center gap-1 rounded-lg border border-[#1f3250] bg-[#0f1a2b] px-3 text-sm font-semibold text-slate-200 transition hover:bg-[#14243a] hover:text-white max-sm:flex-1 sm:flex-none"
            >
              <span className="flex-1">Види ги сите</span>
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>

        {sortedAds.length > 0 ? (
          <div className={adsGridClassName}>
            {sortedAds.map((ad) => {
              const image = ad.images?.[0] || ad.image_url || undefined;
              return (
                <Link key={ad.id} href={`/products/${ad.id}?category=${encodeURIComponent(ad.category)}`}>
                  <AdCard
                    ad={{
                      id: ad.id,
                      title: ad.title,
                      price: ad.price,
                      currency: ad.currency || '€',
                      image_url: image,
                      location: ad.location || ad.city || 'Македонија',
                      description: ad.description,
                      postedAt: ad.created_at,
                      isVerified: Number(ad.seller_rating || 0) >= 4.7,
                      badge: null,
                      sold_at: ad.sold_at,
                    }}
                    layout={cardsPerRow === 2 ? 'list' : 'grid'}
                    showKpId={cardsPerRow !== 6}
                  />
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-[#2a3f55] bg-[#0f1a2b] p-8 text-center text-slate-300">
            <p className="text-lg font-semibold text-white">Нема активни огласи</p>
            <p className="mt-2 text-sm text-slate-400">Кога ќе има огласи во базата, тие автоматски ќе се прикажат тука.</p>
          </div>
        )}
        </section>
      </div>
    </main>
  );
}

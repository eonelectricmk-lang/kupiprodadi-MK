'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Bookmark,
  Heart,
  CalendarDays,
  Copy,
  Eye,
  MapPin,
  MessageCircle,
  Mail,
  Phone,
  Send,
  Share2,
  ShieldCheck,
  Star,
  Truck,
  UserCircle2,
} from 'lucide-react';
import { CATEGORIES } from '@/lib/categories';
import { normalizeCategorySlug } from '@/lib/category-aliases';
import { loadFavoriteIds, subscribeToFavoriteUpdates, toggleFavorite } from '@/lib/client-favorites';

function viberUrl(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('389')) return `viber://chat?number=%2B${digits}`;
  if (digits.startsWith('0')) return `viber://chat?number=%2B389${digits.slice(1)}`;
  return `viber://chat?number=%2B389${digits}`;
}

function waUrl(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('389')) return `https://wa.me/${digits}`;
  if (digits.startsWith('0')) return `https://wa.me/389${digits.slice(1)}`;
  return `https://wa.me/389${digits}`;
}

function tgUrl(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('389')) return `https://t.me/${digits}`;
  if (digits.startsWith('0')) return `https://t.me/389${digits.slice(1)}`;
  return `https://t.me/389${digits}`;
}

function ViberIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M11.4 1.02c.35-.01.72 0 1.08.02 3.58.12 6.88 1.62 9.27 4.3a12.8 12.8 0 0 1 2.17 3.4c1.42 3.36 1.2 7.2-.6 10.38a12.56 12.56 0 0 1-2.16 3.02c-2.44 2.52-5.82 3.96-9.48 3.86-1.17-.04-2.32-.2-3.44-.52-1.2-.34-2.35-.8-3.44-1.38L.7 23.8l1.85-4.5a12.82 12.82 0 0 1-1.3-3.08 12.82 12.82 0 0 1-.22-5.55A12.6 12.6 0 0 1 5.55 2.9 12.49 12.49 0 0 1 11.4 1.02zm.34 4.05c-.14.03-.28.1-.35.22-.14.22-.15.5-.02.72.17.3.33.6.54.87.58.82 1.3 1.53 2.13 2.1.32.23.67.43 1.03.58.22.1.48.07.67-.07.24-.17.32-.5.19-.77a.57.57 0 0 0-.2-.23c-.44-.36-.85-.76-1.22-1.2-.3-.35-.56-.73-.77-1.14-.14-.27-.46-.46-.77-.4a.44.44 0 0 0-.23.15.4.4 0 0 0-.1.11zm-.12 2.4c-.02 0-.05 0-.07.02-.3.07-.55.3-.6.6-.07.37.18.73.56.8.07.02.14.05.2.1.3.2.58.42.84.66.25.26.48.54.68.84.1.16.26.28.44.3.22.03.44-.05.58-.22.17-.2.2-.49.07-.72a6.9 6.9 0 0 0-1.14-1.5 6.8 6.8 0 0 0-1.2-.88.44.44 0 0 0-.24-.07zm-1.56.36c-.18.03-.34.18-.38.37a.54.54 0 0 0 .23.58c.67.45 1.26 1 1.74 1.65.27.36.5.76.68 1.18.06.16.2.28.37.3.22.03.43-.08.54-.27.14-.22.12-.51-.04-.7a7.2 7.2 0 0 0-2.27-1.9.54.54 0 0 0-.31-.08zm-1.1.37c-.14.02-.28.1-.37.23-.15.22-.14.51.02.72.46.58.8 1.24 1.03 1.94.1.3.4.5.72.43.32-.06.53-.38.48-.7-.16-.82-.51-1.59-1.02-2.25a.63.63 0 0 0-.47-.26.5.5 0 0 0-.1-.01zm3.06 2.07c-.27.04-.54.22-.67.48-.16.32-.05.7.26.9.07.05.14.1.2.16a4.1 4.1 0 0 1 1 1.31c.1.2.3.34.53.34.25 0 .48-.14.57-.38.1-.27.02-.58-.2-.76a6 6 0 0 0-1.17-.9.73.73 0 0 0-.31-.1.67.67 0 0 0-.2-.04z"/>
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
    </svg>
  );
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.5.5 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  );
}

interface ProductDetails {
  id: number;
  status?: string;
  title: string;
  description: string;
  price: number;
  currency?: string;
  category?: string;
  subcategory?: string | null;
  condition?: string | null;
  negotiable?: number | boolean;
  location?: string | null;
  city?: string | null;
  neighborhood?: string | null;
  address_note?: string | null;
  delivery?: string | null;
  contact_name?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  preferred_contact?: string | null;
  has_viber?: number | boolean;
  has_whatsapp?: number | boolean;
  has_telegram?: number | boolean;
  trade_possible?: number | boolean;
  image_url?: string | null;
  images?: string[];
  views?: number;
  created_at?: string;
  sold_at?: string | null;
  seller_id?: number;
  seller_name?: string;
  seller_phone?: string;
  seller_email?: string;
  seller_rating?: number;
  seller_avatar_url?: string | null;
  seller_is_active?: number | boolean;
}

type CategoryOption = {
  id: number;
  name: string;
  slug: string;
  icon: string;
  subcategories: Array<{ id: number; name: string; slug: string }>;
};

const FALLBACK_IMAGE = 'https://picsum.photos/900/700?grayscale&blur=1';

function formatPostedAt(value?: string) {
  if (!value) return 'Денес';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Денес';

  return new Intl.DateTimeFormat('mk-MK', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export default function ProductDetailsClient({ id }: { id: string }) {
  const [ad, setAd] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [reported, setReported] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportName, setReportName] = useState('');
  const [reportEmail, setReportEmail] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [sendingReport, setSendingReport] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [contactStatus, setContactStatus] = useState<string | null>(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<{ id: number; name: string; phone?: string; email?: string } | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>(CATEGORIES as CategoryOption[]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchProduct() {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const query = storedUser?.id ? `?seller_id=${storedUser.id}` : '';
        const response = await fetch(`/api/products/${id}${query}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(response.status === 404 ? 'Огласот не постои.' : 'Не можам да го вчитам огласот.');
        }

        const data = await response.json();
        setAd(data);
        setActiveImage(0);
      } catch (fetchError) {
        if ((fetchError as Error).name !== 'AbortError') {
          console.error('Error fetching product:', fetchError);
          setError(fetchError instanceof Error ? fetchError.message : 'Грешка при вчитување на огласот.');
          setAd(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchProduct();

    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    fetch('/api/categories?all=1')
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data?.categories) && data.categories.length) {
          setCategories(data.categories);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (!stored) return;
      const u = JSON.parse(stored);
      if (!u?.id) return;
      setLoggedInUser(u);
    } catch {}
  }, []);

  const images = useMemo(() => {
    if (!ad) return [FALLBACK_IMAGE];
    const merged = [...(ad.images || []), ad.image_url].filter((image): image is string => Boolean(image));
    return Array.from(new Set(merged)).slice(0, 8).concat(merged.length === 0 ? [FALLBACK_IMAGE] : []);
  }, [ad]);

  useEffect(() => {
    if (!ad || typeof window === 'undefined') return;

    const recentViewsKey = 'recently_viewed_ads';
    const nextItem = {
      id: ad.id,
      title: ad.title,
      price: ad.price,
      currency: ad.currency || '€',
      location: ad.location || ad.city || 'Македонија',
      image_url: images[0] || ad.image_url || null,
      viewedAt: new Date().toISOString(),
    };

    try {
      const raw = window.localStorage.getItem(recentViewsKey);
      const parsed = raw ? JSON.parse(raw) : [];
      const list = Array.isArray(parsed) ? parsed.filter((item) => item && item.id !== ad.id) : [];
      list.unshift(nextItem);
      window.localStorage.setItem(recentViewsKey, JSON.stringify(list.slice(0, 12)));
      window.dispatchEvent(new Event('storage'));
    } catch {
      // Ignore storage issues; the page should still work normally.
    }
  }, [ad, images]);

  useEffect(() => {
    if (!ad || typeof window === 'undefined') return;

    const storedUser = JSON.parse(window.localStorage.getItem('user') || '{}');
    const userId = Number(storedUser?.id || 0);
    if (!userId) return;

    loadFavoriteIds(userId).then((ids) => {
      setIsSaved(ids.includes(ad.id));
    });

    return subscribeToFavoriteUpdates((productId, saved) => {
      if (productId === ad.id) {
        setIsSaved(saved);
      }
    });
  }, [ad]);

  const categoryTrail = useMemo(() => {
    if (!ad) return null;

    const rawCat = (ad.category || '').trim();
    const rawSub = (ad.subcategory || '').trim();
    const normalizedCategory = normalizeCategorySlug(rawCat);
    const normalizedSubcategory = normalizeCategorySlug(rawSub);

    for (const category of categories) {
      const catSlug = normalizeCategorySlug(category.slug);
      const matchByName = catSlug === normalizedCategory || category.name === rawCat;
      const matchBySlug = catSlug === rawCat;

      if (matchByName || matchBySlug) {
        const matchedSubcategory = category.subcategories.find((sub) =>
          normalizeCategorySlug(sub.slug) === normalizedSubcategory || sub.name === rawSub
        );
        return {
          category: { name: category.name, slug: category.slug },
          subcategory: matchedSubcategory ? { name: matchedSubcategory.name, slug: matchedSubcategory.slug } : null,
        };
      }

      const matchedSubcategory = category.subcategories.find((sub) =>
        normalizeCategorySlug(sub.slug) === normalizedCategory || sub.name === rawCat || normalizeCategorySlug(sub.slug) === rawCat
      );
      if (matchedSubcategory) {
        return {
          category: { name: category.name, slug: category.slug },
          subcategory: { name: matchedSubcategory.name, slug: matchedSubcategory.slug },
        };
      }
    }

    return null;
  }, [ad, categories]);

  const onCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 1800);
    } catch {
      setCopiedLink(false);
    }
  };

  const onShareFacebook = () => {
    const shareUrl = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, '_blank', 'noopener,noreferrer');
  };

  const onReport = () => {
    if (!ad) return;
    setReportReason('');
    setShowReportModal(true);
  };

  const submitReport = async () => {
    if (!ad) return;
    setSendingReport(true);
    try {
      await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: ad.id,
          reporter_id: loggedInUser?.id || null,
          reason: reportReason || 'Пријавено од корисник',
        }),
      });
      setShowReportModal(false);
      setReported(true);
      setTimeout(() => setReported(false), 3000);
    } catch {}
    setSendingReport(false);
  };

  const onToggleFavorite = async () => {
    if (!ad || typeof window === 'undefined') return;

    const storedUser = JSON.parse(window.localStorage.getItem('user') || '{}');
    const userId = Number(storedUser?.id || 0);

    if (!userId) {
      window.location.href = '/auth';
      return;
    }

    try {
      const saved = await toggleFavorite(userId, ad.id);
      setIsSaved(saved);
    } catch (error) {
      console.error(error);
    }
  };

  const onSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!ad) return;

    if (!loggedInUser) {
      window.location.href = '/auth';
      return;
    }

    setSendingMessage(true);
    setContactStatus(null);

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: loggedInUser.id,
          receiver_id: ad.seller_id,
          product_id: ad.id,
          content: contactMessage.trim(),
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.error || 'Пораката не беше испратена.');
      }

      setContactStatus('Пораката е испратена до продавачот.');
      setContactMessage('');
    } catch (messageError) {
      setContactStatus(messageError instanceof Error ? messageError.message : 'Грешка при праќање порака.');
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="product-detail-page bg-[#050b17] py-8 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="rounded-lg border border-white/10 bg-[#0e1828] py-16 text-center text-slate-400">
            Вчитување оглас...
          </div>
        </div>
      </div>
    );
  }

  if (error || !ad) {
    return (
      <div className="product-detail-page bg-[#050b17] py-8 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="rounded-lg border border-red-500/35 bg-red-500/10 p-4 text-sm text-red-200">
            {error || 'Огласот не е достапен.'}
          </div>
        </div>
      </div>
    );
  }

  const sellerPhone = ad.contact_phone || ad.seller_phone || '';
  const sellerName = ad.contact_name || ad.seller_name || 'Продавач';
  const sellerRating = Number(ad.seller_rating || 0);
  const sellerEmail = ad.contact_email || ad.seller_email || '';
  const sellerAvatarUrl = ad.seller_avatar_url || null;
  const isCrmPublished = ad.seller_email === 'kupiprodadi@system.mk';
  const categoryLink = categoryTrail?.category ? `/categories/${categoryTrail.category.slug}` : null;
  const subcategoryLink = categoryTrail?.subcategory ? `/categories/${categoryTrail.subcategory.slug}` : null;

  return (
    <div className="product-detail-page bg-[#050b17] py-8 text-white">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-5 flex flex-wrap items-center gap-2 text-sm text-white">
          <Link href="/" className="text-white/70 hover:text-white">
            Почетна
          </Link>
          <span className="text-white/40">/</span>
          {categoryTrail?.category && categoryLink ? (
            <>
              <Link href={categoryLink} className="text-white/70 hover:text-white">
                {categoryTrail.category.name}
              </Link>
              {categoryTrail.subcategory && subcategoryLink && (
                <>
                  <span className="text-white/40">/</span>
                  <Link href={subcategoryLink} className="text-white/70 hover:text-white">
                    {categoryTrail.subcategory.name}
                  </Link>
                </>
              )}
            </>
          ) : (
            <span className="text-white/70">Оглас</span>
          )}
        </div>

        {ad.status === 'pending' && (
          <div className="mb-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-center">
            <p className="text-sm font-semibold text-amber-200">Ова е вашиот оглас. Се чека на одобрување од администратор.</p>
            <p className="mt-1 text-xs text-amber-300/70">Огласот е испратен на преглед и ќе биде објавен веднаш штом биде одобрен.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <Link href={`/sell?edit=${ad.id}`} className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-500 transition">
                Измени оглас
              </Link>
              <Link href="/profile" className="inline-flex items-center gap-2 rounded-lg bg-[#0f1a2b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#13243c] transition">
                Врати се на профил
              </Link>
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr]">
          <div className="min-w-0">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0e1828] relative">
              <img src={images[activeImage] || FALLBACK_IMAGE} alt={ad.title} className="block h-[300px] w-full object-cover sm:h-[360px] lg:h-[420px]" />
              {ad.sold_at && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <span className="-rotate-12 rounded border-4 border-red-500 bg-red-500/10 px-4 py-2 text-2xl font-black text-red-500 sm:text-3xl lg:text-4xl leading-tight">ПРОДАДЕНО !</span>
                </div>
              )}
              <button
                type="button"
                onClick={onToggleFavorite}
                className={`absolute right-3 top-3 rounded-full p-2 transition ${
                  isSaved
                    ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                    : 'bg-black/35 text-gray-100 hover:bg-black/50'
                }`}
                aria-label={isSaved ? 'Отстрани од зачувани' : 'Зачувај оглас'}
              >
                <Heart className={`h-5 w-5 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            </div>

            {images.length > 1 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {images.map((image, idx) => (
                  <button
                    key={`${image}-${idx}`}
                    type="button"
                    onClick={() => setActiveImage(idx)}
                    className={`overflow-hidden rounded-lg border bg-[#0e1828] relative ${activeImage === idx ? 'border-red-500' : 'border-white/15'}`}
                  >
                    <img src={image} alt={`${ad.title} ${idx + 1}`} className="block h-16 w-full object-cover sm:h-20" />
                    {ad.sold_at && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <span className="rounded border border-red-500 bg-red-500/10 px-1 py-0.5 text-[7px] font-black text-red-500 leading-tight">ПРОД !</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4 rounded-xl border border-white/10 bg-[#0e1828] p-4 overflow-hidden">
              <h2 className="text-base font-semibold text-white">Опис на огласот</h2>
              <p className="mt-2 break-all whitespace-pre-line text-sm leading-relaxed text-slate-300">{ad.description}</p>
            </div>
          </div>

          <div className="min-w-0 rounded-2xl border border-white/10 bg-[#0e1828] p-6">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-3xl font-bold">{ad.title}</h1>
              <span
                className={`shrink-0 inline-flex items-center ${ad.seller_is_active ? 'text-green-400' : 'text-slate-500'}`}
                title={ad.seller_is_active ? 'Проверен продавач' : 'Непроверен продавач'}
              >
                <ShieldCheck className="h-6 w-6" />
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <p className="text-3xl font-bold text-red-500">
                {ad.price.toLocaleString('mk-MK')} <span className="text-white">{ad.currency || '€'}</span>
              </p>
              {Boolean(ad.negotiable) && <span className="rounded bg-orange-500/20 px-2 py-0.5 text-xs font-semibold text-orange-300">Цена по договор</span>}
              {!ad.negotiable && <span className="rounded bg-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-300">Цената е фиксна</span>}
              {Boolean(ad.trade_possible) && <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-300">Можна замена</span>}
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-[#101f33] px-2.5 py-1">
                <CalendarDays className="h-3.5 w-3.5" /> {formatPostedAt(ad.created_at)}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-[#101f33] px-2.5 py-1">
                <Eye className="h-3.5 w-3.5" /> {Number(ad.views || 0).toLocaleString('mk-MK')} прегледи
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2.5 py-1 text-yellow-400">
                ID: KP-{ad.id.toString().padStart(6, '0')}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              {ad.condition && (
                <div className="rounded-xl border border-white/10 bg-[#101f33] py-2 px-3">
                  <p className="text-xs text-slate-400">Состојба</p>
                  <p className="mt-0.5 font-semibold text-white">{ad.condition}</p>
                </div>
              )}
              <div className="verified-seller-badge rounded-xl border border-green-500/30 bg-green-500/10 py-2 px-3">
                <p className="verified-seller-text flex items-center gap-1.5 text-xs font-semibold text-green-300">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Проверен продавач
                </p>
                <p className="seller-rating-text mt-0.5 flex items-center gap-1.5 text-xs text-amber-300">
                  <Star className="h-3.5 w-3.5" />
                  {sellerRating ? sellerRating.toFixed(1) : '5.0'} рејтинг
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-white/10 bg-[#101f33] p-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-white">{isCrmPublished ? 'Продавач' : 'Профил на продавач'}</h2>
                <span className="inline-flex shrink-0 items-center rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-sm font-semibold text-blue-400">IDP: {ad.seller_id}</span>
              </div>
              <div className="mt-3 flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#172945] text-slate-200">
                  {sellerAvatarUrl ? (
                    <img src={sellerAvatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
                  ) : (
                    <UserCircle2 className="h-9 w-9" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-white">{sellerName}</p>
                      {!isCrmPublished && <p className="mt-1 text-xs text-slate-400">{ad.preferred_contact || 'Телефон и порака'}</p>}
                    </div>
                    <div className="flex shrink-0 flex-col items-start gap-1">
                      {!isCrmPublished && (
                        <>
                          <span className="verified-seller-badge inline-flex items-center gap-1 rounded-full border border-green-500/25 bg-green-500/10 px-2 py-0.5 text-[11px] font-semibold text-green-300">
                            <ShieldCheck className="h-3 w-3" /> Проверен
                          </span>
                          <p className="seller-rating-text flex items-center gap-1 text-xs text-amber-300">
                            <Star className="h-3.5 w-3.5" /> {sellerRating ? sellerRating.toFixed(1) : '5.0'} рејтинг
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-2">
                {sellerPhone && (
                  <a href={`tel:${sellerPhone}`} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/15 bg-[#0f1a2b] px-3 text-sm font-semibold text-white hover:bg-[#13243c]">
                    <Phone className="h-4 w-4" /> {sellerPhone}
                  </a>
                )}
                {sellerPhone && (
                  <div className="flex justify-around gap-2">
                    <a href={Boolean(ad.has_viber) ? viberUrl(sellerPhone) : '#'} target={Boolean(ad.has_viber) ? '_blank' : undefined} rel={Boolean(ad.has_viber) ? 'noopener noreferrer' : undefined} className={`inline-flex items-center gap-1.5 text-sm font-semibold transition ${Boolean(ad.has_viber) ? 'text-purple-400 hover:text-purple-300' : 'text-slate-600 cursor-default pointer-events-none'}`}>
                      <ViberIcon className="h-4 w-4" /> Viber
                    </a>
                    <a href={Boolean(ad.has_whatsapp) ? waUrl(sellerPhone) : '#'} target={Boolean(ad.has_whatsapp) ? '_blank' : undefined} rel={Boolean(ad.has_whatsapp) ? 'noopener noreferrer' : undefined} className={`inline-flex items-center gap-1.5 text-sm font-semibold transition ${Boolean(ad.has_whatsapp) ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-600 cursor-default pointer-events-none'}`}>
                      <WhatsAppIcon className="h-4 w-4" /> WhatsApp
                    </a>
                    <a href={Boolean(ad.has_telegram) ? tgUrl(sellerPhone) : '#'} target={Boolean(ad.has_telegram) ? '_blank' : undefined} rel={Boolean(ad.has_telegram) ? 'noopener noreferrer' : undefined} className={`inline-flex items-center gap-1.5 text-sm font-semibold transition ${Boolean(ad.has_telegram) ? 'text-sky-400 hover:text-sky-300' : 'text-slate-600 cursor-default pointer-events-none'}`}>
                      <TelegramIcon className="h-4 w-4" /> Telegram
                    </a>
                  </div>
                )}
                {!isCrmPublished && sellerEmail && (
                  <a href={`mailto:${sellerEmail}`} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/15 bg-[#0f1a2b] px-3 text-sm font-semibold text-white hover:bg-[#13243c]">
                    <Mail className="h-4 w-4" /> {sellerEmail}
                  </a>
                )}
              </div>
            </div>

            {loggedInUser?.id !== ad.seller_id && (
              isCrmPublished && sellerPhone ? (
                <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center">
                  <p className="text-sm font-semibold text-emerald-300">📞 Контактирај директно со огласувачот</p>
                  <a href={`tel:${sellerPhone}`} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-lg font-bold text-white hover:bg-emerald-500 transition">
                    <Phone className="h-5 w-5" /> {sellerPhone}
                  </a>
                </div>
              ) : (
                <form onSubmit={onSendMessage} className="mt-4 rounded-xl border border-white/10 bg-[#101f33] p-4">
                  <h2 className="flex items-center gap-2 text-base font-semibold text-white">
                    <MessageCircle className="h-4 w-4" /> Контактирај продавач
                  </h2>
                  <div className="mt-3 grid gap-3">
                    <div className="rounded-lg border border-[#2a3f60] bg-[#0f1a2b] px-3 py-2 text-sm text-slate-400">
                      {loggedInUser ? `Порака од: ${loggedInUser.name}` : 'Мора да се најавите за да испратите порака'}
                    </div>
                    <textarea
                      required
                      minLength={5}
                      value={contactMessage}
                      onChange={(event) => setContactMessage(event.target.value)}
                      placeholder={`Здраво, заинтересиран сум за ${ad.title}. Дали е уште достапно?`}
                      className="min-h-28 resize-y rounded-lg border border-[#2a3f60] bg-[#0f1a2b] px-3 py-2 text-sm leading-5 text-white outline-none placeholder:text-slate-500 focus:border-red-500"
                    />
                    {contactStatus && (
                      <p className="rounded-lg border border-white/10 bg-[#0f1a2b] px-3 py-2 text-xs text-slate-200">
                        {contactStatus}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={sendingMessage || !loggedInUser}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <Send className="h-4 w-4" /> {sendingMessage ? 'Испраќање...' : 'Испрати порака'}
                    </button>
                  </div>
                </form>
              )
            )}

            {ad.status !== 'pending' && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={onToggleFavorite}
                  className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg border text-sm font-semibold transition ${
                    isSaved
                      ? 'border-red-500/40 bg-red-500/10 text-red-200'
                      : 'border-white/15 bg-[#0f1a2b] text-white hover:bg-[#13243c]'
                  }`}
                >
                  <Bookmark className="h-4 w-4" /> {isSaved ? 'Зачувано' : 'Зачувај'}
                </button>
                <button
                  type="button"
                  onClick={onCopyLink}
                  className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg border text-sm font-semibold transition ${
                    copiedLink
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                      : 'border-white/15 bg-[#0f1a2b] text-white hover:bg-[#13243c]'
                  }`}
                >
                  <Copy className="h-4 w-4" /> {copiedLink ? 'Копирано' : 'Копирај линк'}
                </button>
                <button
                  type="button"
                  onClick={onShareFacebook}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/15 bg-[#0f1a2b] text-sm font-semibold text-white hover:bg-[#13243c]"
                >
                  <Share2 className="h-4 w-4" /> Сподели
                </button>
                <button
                  type="button"
                  onClick={onReport}
                  className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg border text-sm font-semibold transition ${
                    reported
                      ? 'border-amber-500/40 bg-amber-500/10 text-amber-200'
                      : 'border-white/15 bg-[#0f1a2b] text-white hover:bg-[#13243c]'
                  }`}
                >
                  <AlertTriangle className="h-4 w-4" /> {reported ? 'Пријавено' : 'Пријави'}
                </button>
              </div>
            )}

            {ad.delivery && (
              <div className="mt-4 rounded-xl border border-white/10 bg-[#101f33] p-4 text-sm text-slate-300">
                <p className="flex items-center gap-2 font-semibold text-white">
                  <Truck className="h-4 w-4" /> Достава
                </p>
                <p className="mt-2">{ad.delivery}</p>
              </div>
            )}

            <div className="mt-4 rounded-xl border border-white/10 bg-[#101f33] p-4 text-sm text-slate-300">
              <p className="flex items-center gap-2 font-semibold text-white">
                <MapPin className="h-4 w-4" /> Локација
              </p>
              <p className="mt-2">
                {ad.city || ad.location || 'Македонија'}
                {ad.neighborhood ? `, ${ad.neighborhood}` : ''}
                {ad.address_note ? ` - ${ad.address_note}` : ''}
              </p>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-[#101f33] px-2.5 py-1">
                <Copy className="h-3.5 w-3.5" /> Безбедна комуникација
              </span>
            </div>
          </div>
        </div>
      </div>

      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowReportModal(false)}>
          <div className="mx-4 w-full max-w-md rounded-xl border border-[#1d2c43] bg-[#0b1727] p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs leading-5 text-amber-200">
              kupiprodadi.mk нема своја курирска служба, не посредува при плаќање и не комуницира со корисниците за вашите објави. Чувајте се од измами!
            </div>
            <h3 className="text-lg font-bold text-white">Пријавете злоупотреба</h3>
            <p className="mt-1 text-sm text-slate-400">Овој оглас ќе биде прегледан од администратор.</p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-200">Опишете ја причината за пријавата</label>
                <textarea
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                  placeholder="Кратко објаснување зошто го пријавувате овој оглас..."
                  rows={4}
                  className="mt-1 w-full rounded-lg border border-[#223653] bg-[#081223] px-3 py-2 text-sm text-white outline-none focus:border-sky-500/50 resize-none"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 rounded-lg border border-[#223653] bg-[#081223] px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-[#122038] transition"
              >
                Откажи
              </button>
              <button
                onClick={submitReport}
                disabled={sendingReport}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition"
              >
                {sendingReport ? 'Се испраќа...' : 'Испрати'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  AlertTriangle,
  Bookmark,
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

interface ProductDetails {
  id: number;
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
  image_url?: string | null;
  images?: string[];
  views?: number;
  created_at?: string;
  seller_id?: number;
  seller_name?: string;
  seller_phone?: string;
  seller_email?: string;
  seller_rating?: number;
}

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

export default function AdDetailsPage() {
  const params = useParams<{ id: string }>();
  const [ad, setAd] = useState<ProductDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [reported, setReported] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactStatus, setContactStatus] = useState<string | null>(null);
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchProduct() {
      if (!params?.id) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/products/${params.id}`, {
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
  }, [params?.id]);

  const images = useMemo(() => {
    if (!ad) return [FALLBACK_IMAGE];
    const merged = [...(ad.images || []), ad.image_url].filter((image): image is string => Boolean(image));
    return Array.from(new Set(merged)).slice(0, 8).concat(merged.length === 0 ? [FALLBACK_IMAGE] : []);
  }, [ad]);

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
    setReported(true);
    setTimeout(() => setReported(false), 2000);
  };

  const onSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!ad) return;

    setSendingMessage(true);
    setContactStatus(null);

    try {
      const demoBuyerId = ad.seller_id === 1 ? 2 : 1;
      const content = [
        contactMessage.trim(),
        contactName.trim() ? `Име: ${contactName.trim()}` : '',
        contactPhone.trim() ? `Телефон: ${contactPhone.trim()}` : '',
      ].filter(Boolean).join('\n');

      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: demoBuyerId,
          receiver_id: ad.seller_id,
          product_id: ad.id,
          content,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.error || 'Пораката не беше испратена.');
      }

      setContactStatus('Пораката е испратена до продавачот.');
      setContactName('');
      setContactPhone('');
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

  return (
    <div className="product-detail-page bg-[#050b17] py-8 text-white">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr]">
          <div>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0e1828]">
              <img src={images[activeImage] || FALLBACK_IMAGE} alt={ad.title} className="block h-[300px] w-full object-cover sm:h-[360px] lg:h-[420px]" />
            </div>

            {images.length > 1 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {images.map((image, idx) => (
                  <button
                    key={`${image}-${idx}`}
                    type="button"
                    onClick={() => setActiveImage(idx)}
                    className={`overflow-hidden rounded-lg border bg-[#0e1828] ${activeImage === idx ? 'border-red-500' : 'border-white/15'}`}
                  >
                    <img src={image} alt={`${ad.title} ${idx + 1}`} className="block h-16 w-full object-cover sm:h-20" />
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4 rounded-xl border border-white/10 bg-[#0e1828] p-4">
              <h2 className="text-base font-semibold text-white">Опис на огласот</h2>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-300">{ad.description}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0e1828] p-6">
            <h1 className="text-3xl font-bold">{ad.title}</h1>
            <p className="mt-2 text-3xl font-bold text-red-500">
              {ad.price.toLocaleString('mk-MK')} <span className="text-white">{ad.currency || '€'}</span>
            </p>
            {Boolean(ad.negotiable) && <p className="mt-1 text-sm font-semibold text-slate-300">Цена по договор</p>}

            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-[#101f33] px-2.5 py-1">
                <CalendarDays className="h-3.5 w-3.5" /> {formatPostedAt(ad.created_at)}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-[#101f33] px-2.5 py-1">
                <Eye className="h-3.5 w-3.5" /> {Number(ad.views || 0).toLocaleString('mk-MK')} прегледи
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-[#101f33] px-2.5 py-1">
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
                <h2 className="text-base font-semibold text-white">Профил на продавач</h2>
                <p className="text-sm font-semibold text-white">ID: KP-{ad.id.toString().padStart(6, '0')}</p>
              </div>
              <div className="mt-3 flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#172945] text-slate-200">
                  <UserCircle2 className="h-9 w-9" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-white">{sellerName}</p>
                      <p className="mt-1 text-xs text-slate-400">{ad.preferred_contact || 'Телефон и порака'}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-start gap-1">
                      <span className="verified-seller-badge inline-flex items-center gap-1 rounded-full border border-green-500/25 bg-green-500/10 px-2 py-0.5 text-[11px] font-semibold text-green-300">
                        <ShieldCheck className="h-3 w-3" /> Проверен
                      </span>
                      <p className="seller-rating-text flex items-center gap-1 text-xs text-amber-300">
                        <Star className="h-3.5 w-3.5" /> {sellerRating ? sellerRating.toFixed(1) : '5.0'} рејтинг
                      </p>
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
                {sellerEmail && (
                  <a href={`mailto:${sellerEmail}`} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/15 bg-[#0f1a2b] px-3 text-sm font-semibold text-white hover:bg-[#13243c]">
                    <Mail className="h-4 w-4" /> {sellerEmail}
                  </a>
                )}
              </div>
            </div>

            <form onSubmit={onSendMessage} className="mt-4 rounded-xl border border-white/10 bg-[#101f33] p-4">
              <h2 className="flex items-center gap-2 text-base font-semibold text-white">
                <MessageCircle className="h-4 w-4" /> Контактирај продавач
              </h2>
              <div className="mt-3 grid gap-3">
                <input
                  value={contactName}
                  onChange={(event) => setContactName(event.target.value)}
                  placeholder="Твоето име"
                  className="h-10 rounded-lg border border-[#2a3f60] bg-[#0f1a2b] px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-red-500"
                />
                <input
                  value={contactPhone}
                  onChange={(event) => setContactPhone(event.target.value)}
                  placeholder="Телефон за контакт"
                  type="tel"
                  className="h-10 rounded-lg border border-[#2a3f60] bg-[#0f1a2b] px-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-red-500"
                />
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
                  disabled={sendingMessage}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-600 px-3 text-sm font-bold text-white hover:bg-red-700 disabled:bg-slate-700"
                >
                  <Send className="h-4 w-4" /> {sendingMessage ? 'Се праќа...' : 'Испрати порака'}
                </button>
              </div>
            </form>

            <div className="mt-6 grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsSaved((prev) => !prev)}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-[#0f1a2b] px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-[#13243c]"
              >
                <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                {isSaved ? 'Сочувано' : 'Зачувај'}
              </button>
              <button
                onClick={onShareFacebook}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-[#0f1a2b] px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-[#13243c]"
              >
                <Share2 className="h-4 w-4" /> Facebook
              </button>
              <button
                onClick={onCopyLink}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-[#0f1a2b] px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-[#13243c]"
              >
                <Copy className="h-4 w-4" /> {copiedLink ? 'Копирано' : 'Копирај линк'}
              </button>
              <button
                onClick={onReport}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-500/35 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/20"
              >
                <AlertTriangle className="h-4 w-4" /> {reported ? 'Пријавено' : 'Пријави злоупотреба'}
              </button>
            </div>

            <div className="mt-3 rounded-xl border border-white/10 bg-[#101f33] p-3">
              <h3 className="text-sm font-semibold text-white">Локација</h3>
              <p className="mt-1.5 flex items-center gap-2 text-sm text-slate-300">
                <MapPin className="h-4 w-4" />
                {ad.location || ad.city || 'Македонија'}
              </p>
              {ad.address_note && <p className="mt-1 text-xs text-slate-400">{ad.address_note}</p>}

              <div className="mt-2 overflow-hidden rounded-lg border border-white/10">
                <iframe
                  title="Мапа за локација"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(ad.location || ad.city || 'Македонија')}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                  className="h-36 w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

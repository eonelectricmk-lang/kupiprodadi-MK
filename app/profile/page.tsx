'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ElementType, ReactNode } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Clock3,
  Eye,
  Heart,
  Inbox,
  MapPin,
  MessageSquare,
  PencilLine,
  PenSquare,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  UserCircle2,
} from 'lucide-react';
import { Header } from '@/app/components/Header';
import { Card, Container } from '@/app/components/ui';
import { useRouter } from 'next/navigation';

type Product = {
  id: number;
  title: string;
  price: number;
  currency?: string;
  location?: string;
  city?: string;
  neighborhood?: string;
  address_note?: string;
  delivery?: string;
  contact_phone?: string;
  contact_email?: string;
  preferred_contact?: string;
  condition?: string;
  negotiable?: boolean;
  category?: string;
  subcategory?: string;
  image_url?: string;
  images?: string[];
  description?: string;
  views?: number;
  created_at?: string;
  status?: string;
};

type Message = {
  id: number;
  sender_id: number;
  receiver_id: number;
  product_id?: number | null;
  sender_name: string;
  receiver_name: string;
  content: string;
  product_title: string;
  read: boolean;
  created_at: string;
};

type SellingOrder = {
  id: number;
  product_id: number;
  title: string;
  buyer_name?: string;
  buyer_email?: string;
  status?: string;
  created_at: string;
  total_price: number;
};

type RecentView = {
  id: number;
  title: string;
  price: number;
  currency?: string;
  location?: string;
  image_url?: string | null;
  viewedAt: string;
};

type TabKey = 'ads' | 'saved' | 'settings' | 'messages';

function formatDate(value?: string, options?: Intl.DateTimeFormatOptions) {
  if (!value) return 'Денес';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Денес';
  return new Intl.DateTimeFormat('mk-MK', options || { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
}

function readRecentViews(): RecentView[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem('recently_viewed_ads');
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function toDateKey(value: Date) {
  return [
    value.getFullYear(),
    String(value.getMonth() + 1).padStart(2, '0'),
    String(value.getDate()).padStart(2, '0'),
  ].join('-');
}

function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card className="!rounded-[16px] border-[#1d2c43] bg-[#0b1423] p-4 text-center sm:p-5">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-[#223653] bg-[#081223] text-slate-400">
        <AlertCircle className="h-4 w-4" />
      </div>
      <h3 className="mt-3 text-base font-semibold text-white sm:text-lg">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </Card>
  );
}

function MiniAdCard({
  title,
  meta,
  price,
  image,
  href,
  note,
  status,
}: {
  title: string;
  meta: string;
  price: string;
  image?: string | null;
  href: string;
  note?: string;
  status?: string;
}) {
  const statusStyles: Record<string, string> = {
    active: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    pending: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    rejected: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
    sold: 'border-slate-500/30 bg-slate-500/10 text-slate-300',
  };

  const statusLabels: Record<string, string> = {
    active: 'Активен',
    pending: 'Во преглед',
    rejected: 'Одбиен',
    sold: 'Продаден',
  };

  const resolvedStatus = status || null;
  const statusClass = resolvedStatus ? statusStyles[resolvedStatus] || statusStyles.active : '';
  const statusLabel = resolvedStatus ? statusLabels[resolvedStatus] || statusLabels.active : '';

  return (
    <Link
      href={href}
      className="group overflow-hidden rounded-[14px] border border-[#1d2c43] bg-[#0f1a2b] transition hover:-translate-y-0.5 hover:border-[#2d4f7d] hover:bg-[#122038]"
    >
      <div className="relative h-24 overflow-hidden sm:h-28">
        <img
          src={image || 'https://picsum.photos/640/480?grayscale&blur=1'}
          alt={title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        {resolvedStatus && (
          <div className="absolute left-2 top-2">
            <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusClass}`}>
              {statusLabel}
            </span>
          </div>
        )}
      </div>
      <div className="space-y-1.5 p-3">
        <p className="line-clamp-2 text-sm font-semibold text-white">{title}</p>
        <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
          <span className="truncate">{meta}</span>
          <span className="shrink-0 font-bold text-red-400">{price}</span>
        </div>
        <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500">
          <span>{note || 'Отвори'}</span>
          <span className="text-slate-600">›</span>
        </div>
      </div>
    </Link>
  );
}

function OwnerAdCard({
  productId,
  title,
  meta,
  price,
  image,
  images,
  href,
  note,
  status,
  sellerName,
  description,
  createdAt,
  views,
  messageCount,
  location,
  category,
  subcategory,
  condition,
  delivery,
  phone,
  email,
  contactPreference,
  negotiable,
  onRefresh,
  onEdit,
  onDelete,
  onPromote,
}: {
  productId?: number;
  title: string;
  meta: string;
  price: string;
  image?: string | null;
  images?: string[];
  href: string;
  note?: string;
  status?: string;
  sellerName?: string;
  description?: string;
  createdAt?: string;
  views?: number;
  messageCount?: number;
  location?: string;
  category?: string;
  subcategory?: string;
  condition?: string;
  delivery?: string;
  phone?: string;
  email?: string;
  contactPreference?: string;
  negotiable?: boolean;
  onRefresh: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onPromote: () => void;
}) {
  const statusStyles: Record<string, string> = {
    active: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    pending: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    rejected: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
    sold: 'border-slate-500/30 bg-slate-500/10 text-slate-300',
  };

  const statusLabels: Record<string, string> = {
    active: 'Активен',
    pending: 'Во преглед',
    rejected: 'Одбиен',
    sold: 'Продаден',
  };

  const resolvedStatus = status || null;
  const statusClass = resolvedStatus ? statusStyles[resolvedStatus] || statusStyles.active : '';
  const statusLabel = resolvedStatus ? statusLabels[resolvedStatus] || statusLabels.active : '';
  const galleryImages = (images || []).filter(Boolean);
  const mainImage = galleryImages[0] || image || 'https://picsum.photos/640/480?grayscale&blur=1';
  const thumbImages = [mainImage, ...galleryImages.slice(1, 4)];
  const savedCount = 0;
  const promoClicks = 0;

  return (
    <div className="w-full overflow-hidden rounded-[18px] border border-[#1d2c43] bg-[linear-gradient(135deg,#081120_0%,#0c182b_56%,#091423_100%)] shadow-[0_12px_24px_rgba(0,0,0,0.2)]">
      <div className="grid gap-0 xl:grid-cols-[268px_minmax(0,1fr)_286px]">
        <div className="border-b border-[#223653] p-3.5 xl:border-b-0 xl:border-r">
          <Link href={href} className="group block">
            <div className="relative h-[186px] overflow-hidden rounded-[14px] border border-[#223653] bg-[#0b1727] sm:h-[196px] xl:h-[208px]">
              <img
                src={mainImage}
                alt={title}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
              {resolvedStatus && (
                <div className="absolute left-2 top-2">
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusClass}`}>
                    {statusLabel}
                  </span>
                </div>
              )}
            </div>
          </Link>

          <div className="mt-2.5">
            <div className="grid grid-cols-4 gap-1.5">
              {Array.from({ length: 4 }).map((_, index) => {
                const thumb = thumbImages[index];
                return (
                  <div
                    key={`${title}-thumb-${index}`}
                    className={`h-11 overflow-hidden rounded-[10px] border ${
                      thumb
                        ? index === 0
                          ? 'border-sky-500/60 bg-[#0b1727]'
                          : 'border-[#223653] bg-[#0b1727]'
                        : 'border-dashed border-[#30435f] bg-[#081223]'
                    }`}
                  >
                    {thumb ? (
                      <img src={thumb} alt={`${title} ${index + 1}`} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[28px] leading-none text-slate-500">+</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="min-w-0 p-3.5 pb-2 xl:border-r xl:border-[#223653] xl:p-4 xl:pb-2.5">
          <div className="flex h-full flex-col gap-0">
            <div className="flex flex-wrap items-start justify-between gap-2.5">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-[8px] border border-[#28415f] bg-[#0d1b2f] px-3 py-1 text-[12px] font-medium text-slate-200">
                  {sellerName || 'Продавач'}
                </span>
                <Link href={href} className="min-w-0">
                  <p className="line-clamp-2 text-[22px] font-black tracking-[-0.03em] text-white transition hover:text-sky-300">
                    {title}
                  </p>
                </Link>
              </div>
              {typeof productId === 'number' && (
                <span className="inline-flex shrink-0 items-center rounded-[8px] border border-[#223653] bg-[#081223] px-3 py-1 text-[11px] font-semibold text-slate-400">
                  ID: KP-{String(productId).padStart(5, '0')}
                </span>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-[12px] text-slate-400">
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-500" />
                {location || meta}
              </span>
              <span className="text-slate-600">•</span>
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-slate-500" />
                {formatDate(createdAt)}
              </span>
            </div>

            <p className="mt-3 line-clamp-2 max-w-3xl text-[13px] leading-5 text-slate-300">
              {description || 'Нема внесен опис за овој оглас.'}
            </p>

            <div className="mt-auto -translate-y-1 border-t border-[#223653] pt-1.5">
              <div className="flex items-center gap-2 overflow-x-auto xl:overflow-visible">
                <button
                  type="button"
                  onClick={onEdit}
                  className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[10px] border border-[#2b3f5f] bg-[#0b1727] px-2.5 py-1.5 text-[11px] font-semibold text-slate-100 transition hover:bg-[#122038] hover:text-white"
                >
                  <PencilLine className="h-3.5 w-3.5" />
                  Измени
                </button>
                <button
                  type="button"
                  onClick={onRefresh}
                  className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[10px] border border-sky-500/35 bg-sky-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-sky-300 transition hover:bg-sky-500/15"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Обнови
                </button>
                <button
                  type="button"
                  onClick={onPromote}
                  className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[10px] border border-amber-500/35 bg-amber-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-amber-300 transition hover:bg-amber-500/15"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Промовирај
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[10px] border border-rose-500/35 bg-rose-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-rose-300 transition hover:bg-rose-500/15"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Избриши
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 p-3.5 pb-2 xl:p-4 xl:pb-2.5">
          <div className="flex items-start justify-between gap-3 border-b border-[#223653] pb-2">
            <p className="text-[25px] font-black tracking-[-0.03em] text-red-400">{price}</p>
            <span className={`inline-flex items-center gap-2 rounded-[12px] border px-3 py-1.5 text-[11px] font-semibold ${statusClass || 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'}`}>
              <span className="h-2.5 w-2.5 rounded-full bg-current opacity-90" />
              {resolvedStatus ? statusLabel : 'Активен'}
            </span>
          </div>

          <div className="rounded-[16px] border border-[#223653] bg-[#0a1628] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
            <p className="text-[15px] font-bold text-white">Статистика за огласот</p>

            <div className="mt-2.5 space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-[13px] text-slate-400">
                  <Eye className="h-4 w-4 text-slate-500" />
                  Прегледи
                </span>
                <span className="text-[14px] font-bold text-white">{Number((views || 0)).toLocaleString('mk-MK')}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-[13px] text-slate-400">
                  <MessageSquare className="h-4 w-4 text-slate-500" />
                  Пораки
                </span>
                <span className="text-[14px] font-bold text-white">{Number((messageCount || 0)).toLocaleString('mk-MK')}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-[13px] text-slate-400">
                  <Heart className="h-4 w-4 text-slate-500" />
                  Зачувувања
                </span>
                <span className="text-[14px] font-bold text-white">{savedCount}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 text-[13px] text-slate-400">
                  <ArrowRight className="h-4 w-4 text-slate-500" />
                  Промо кликови
                </span>
                <span className="text-[14px] font-bold text-white">{promoClicks}</span>
              </div>
            </div>

            <button
              type="button"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-[12px] border border-sky-500/35 bg-sky-500/10 px-4 py-2 text-[12px] font-semibold text-sky-300 transition hover:bg-sky-500/15"
            >
              <Inbox className="h-4 w-4" />
              Детална статистика
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-[#081223] px-3.5 py-2.5">
      <span className="text-slate-400">{label}</span>
      <span className="text-right font-medium text-white">{value}</span>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: ReactNode;
  icon: ElementType;
  accent: string;
}) {
  return (
    <div className="rounded-[14px] border border-[#223653] bg-[#081223] px-3 py-2.5 sm:px-3.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] text-slate-500 sm:text-xs">{label}</span>
        <Icon className={`h-3.5 w-3.5 ${accent}`} />
      </div>
      <p className="mt-0.5 text-[18px] font-black leading-none text-white sm:text-[22px]">{value}</p>
    </div>
  );
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-lg px-3.5 py-1.5 text-sm font-semibold transition sm:px-4 ${
        active
          ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
          : 'border border-[#223653] bg-[#081223] text-slate-300 hover:bg-[#122038] hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sellingOrders, setSellingOrders] = useState<SellingOrder[]>([]);
  const [recentViews, setRecentViews] = useState<RecentView[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>('ads');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const requestedTab = new URLSearchParams(window.location.search).get('tab');
    if (requestedTab === 'ads' || requestedTab === 'saved' || requestedTab === 'settings' || requestedTab === 'messages') {
      setActiveTab(requestedTab);
    }
  }, []);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (!userData.id) {
      window.location.href = '/auth';
      return;
    }

    setUser(userData);
    setRecentViews(readRecentViews());

    const load = async () => {
      try {
        const [adsRes, favRes, msgRes, salesRes] = await Promise.all([
          fetch(`/api/products?seller_id=${userData.id}&all=1`),
          fetch(`/api/favorites?user_id=${userData.id}`),
          fetch(`/api/messages?user_id=${userData.id}`),
          fetch(`/api/orders?user_id=${userData.id}&type=selling`),
        ]);

        const [adsData, favData, msgData, salesData] = await Promise.all([
          adsRes.json(),
          favRes.json(),
          msgRes.json(),
          salesRes.json(),
        ]);

        setMyProducts(Array.isArray(adsData?.products) ? adsData.products : []);
        setFavorites(Array.isArray(favData) ? favData : []);
        setMessages(Array.isArray(msgData) ? msgData : []);
        setSellingOrders(Array.isArray(salesData) ? salesData : []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    const refreshRecentViews = () => setRecentViews(readRecentViews());
    window.addEventListener('storage', refreshRecentViews);
    window.addEventListener('focus', refreshRecentViews);
    return () => {
      window.removeEventListener('storage', refreshRecentViews);
      window.removeEventListener('focus', refreshRecentViews);
    };
  }, []);

  const unreadMessages = useMemo(
    () => messages.filter((message) => !message.read && message.receiver_id === user?.id).length,
    [messages, user?.id],
  );

  const activeAds = useMemo(
    () => myProducts.filter((product) => product.status === 'active').length,
    [myProducts],
  );

  const soldAds = useMemo(
    () => sellingOrders.filter((order) => order.status && order.status !== 'pending').length,
    [sellingOrders],
  );

  const locationLabel = user?.location || 'Цела Македонија';
  const joinedLabel = user?.created_at
    ? formatDate(user.created_at, { month: 'long', year: 'numeric' })
    : 'Не е внесен';

  const recentViewsByDay = useMemo(() => {
    const labels = ['Нед', 'Пон', 'Вто', 'Сре', 'Чет', 'Пет', 'Саб'];
    const today = new Date();
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      return {
        key: toDateKey(date),
        label: labels[date.getDay()],
        count: 0,
      };
    });

    const byKey = new Map(days.map((day) => [day.key, day]));
    recentViews.forEach((view) => {
      const viewedDate = new Date(view.viewedAt);
      if (Number.isNaN(viewedDate.getTime())) return;
      const key = toDateKey(viewedDate);
      const target = byKey.get(key);
      if (target) target.count += 1;
    });

    return days;
  }, [recentViews]);

  const maxRecentViews = Math.max(...recentViewsByDay.map((day) => day.count), 1);

  const sortedMyProducts = useMemo(
    () =>
      [...myProducts].sort(
        (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime(),
      ),
    [myProducts],
  );

  const messageCountsByProduct = useMemo(() => {
    return messages.reduce<Record<number, number>>((acc, message) => {
      if (typeof message.product_id === 'number') {
        acc[message.product_id] = (acc[message.product_id] || 0) + 1;
      }
      return acc;
    }, {});
  }, [messages]);

  const refreshProduct = async (productId: number) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'bump', seller_id: user?.id }),
      });

      if (!response.ok) {
        throw new Error('Не успеа обновувањето.');
      }

      const now = new Date().toISOString();
      setMyProducts((prev) =>
        prev
          .map((product) =>
            product.id === productId ? { ...product, created_at: now, status: 'active' } : product,
          )
          .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()),
      );
    } catch (error) {
      console.error(error);
      window.alert('Не успеа обновувањето на огласот.');
    }
  };

  const deleteProduct = async (productId: number) => {
    const confirmed = window.confirm('Сигурен ли си дека сакаш да го избришеш огласот?');
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/products/${productId}?seller_id=${user?.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Не успеа бришењето.');
      }

      setMyProducts((prev) => prev.filter((product) => product.id !== productId));
    } catch (error) {
      console.error(error);
      window.alert('Не успеа бришењето на огласот.');
    }
  };

  const editProduct = (productId: number) => {
    router.push(`/sell?edit=${productId}`);
  };

  const promoteProduct = (productId: number) => {
    router.push(`/sell?promote=${productId}`);
  };

  const tabs: Array<{ id: TabKey; label: string }> = [
    { id: 'ads', label: 'Мои огласи' },
    { id: 'saved', label: 'Зачувани' },
    { id: 'settings', label: 'Уреди профил' },
    { id: 'messages', label: 'Пораки' },
  ];

  const changeTab = (tab: TabKey) => {
    setActiveTab(tab);
    router.replace(`/profile?tab=${tab}`, { scroll: false });
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#040914] text-white">
        <Header />
        <Container className="py-12">
          <div className="rounded-3xl border border-[#1d2c43] bg-[#0b1423] py-16 text-center text-slate-400">
            Вчитување профил...
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040914] text-white">
      <Header />
      <Container className="py-3 md:py-4">
        <div className="mx-auto max-w-6xl space-y-3">
          <section className="overflow-hidden rounded-[18px] border border-[#1d2c43] bg-gradient-to-br from-[#081223] via-[#0b1423] to-[#07101c] shadow-xl shadow-black/20">
            <div className="grid gap-2 p-2.5 sm:p-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)] lg:items-start">
              <div className="min-w-0">
                <div className="flex min-w-0 gap-3.5">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#223653] bg-[#0b1727] sm:h-16 sm:w-16">
                    <UserCircle2 className="h-8 w-8 text-slate-300 sm:h-9 sm:w-9" />
                  </div>

                  <div className="min-w-0 flex-1 pl-1 sm:pl-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="truncate text-[18px] font-black tracking-tight sm:text-[25px]">{user.name}</h1>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-sky-300">
                        <PenSquare className="h-3.5 w-3.5" />
                        Активни огласи {activeAds}
                      </span>
                      <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-300">
                        ID #{user.id}
                      </span>
                    </div>

                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] leading-none text-slate-500 sm:text-xs">Профил со доверба и брз пристап до твоите огласи.</span>
                    </div>

                    <p className="mt-0.5 max-w-lg text-[12px] leading-[1.1] text-slate-400 sm:text-[13px] sm:leading-[1.25]">
                      Управувај со огласите, следи ги зачуваните ставки и
                      <span className="block">провери ги основните податоци на едно место.</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-1 lg:justify-self-end">
                <div className="flex flex-wrap items-center gap-1.5 lg:justify-end">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#223653] bg-[#081223] px-2.5 py-1 text-[11px] text-slate-300 sm:text-xs">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                    {locationLabel}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#223653] bg-[#081223] px-2.5 py-1 text-[11px] text-slate-300 sm:text-xs">
                    <Clock3 className="h-3.5 w-3.5 text-sky-400" />
                    Член од {joinedLabel}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#223653] bg-[#081223] px-2.5 py-1 text-[11px] text-slate-300 sm:text-xs">
                    <BadgeCheck className="h-3.5 w-3.5 text-emerald-400" />
                    Активен профил
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-[5px] sm:gap-1.5">
                  <StatCard label="Активни огласи" value={activeAds} icon={PenSquare} accent="text-sky-400" />
                  <StatCard label="Продадени" value={soldAds} icon={Heart} accent="text-pink-400" />
                  <StatCard label="Оценка" value={`${Number(user.rating || 5).toFixed(1)}/5`} icon={Star} accent="text-amber-400" />
                </div>
              </div>
            </div>
          </section>

          <div className="flex gap-1.5 overflow-x-auto rounded-[14px] border border-[#1d2c43] bg-[#0b1423] p-[5px]">
            {tabs.map((tab) => (
              <TabButton key={tab.id} active={activeTab === tab.id} onClick={() => changeTab(tab.id)}>
                {tab.label}
              </TabButton>
            ))}
          </div>

          {activeTab === 'ads' && (
            <section className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <h2 className="text-[17px] font-bold sm:text-xl">Мои огласи</h2>
                    <p className="text-[13px] text-slate-400 sm:text-sm">Компактна листа со активни, во преглед и архивирани огласи.</p>
                  </div>
                </div>
                <Link
                  href="/sell"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#223653] bg-[#081223] px-3 py-1.5 text-[11px] font-semibold text-slate-300 transition hover:bg-[#122038] hover:text-white sm:text-xs"
                >
                  Нов оглас <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {myProducts.length === 0 ? (
                <EmptyState
                  title="Немаш огласи за сега"
                  description="Објави прв оглас и ќе се појави тука веднаш штом биде активен."
                  action={
                    <Link href="/sell" className="inline-flex rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700">
                      Објави прв оглас
                    </Link>
                  }
                />
              ) : (
                <div className="space-y-3">
                  {sortedMyProducts.slice(0, 9).map((product) => (
                    <OwnerAdCard
                      key={product.id}
                      productId={product.id}
                      href={`/products/${product.id}`}
                      title={product.title}
                      meta={`${product.location || 'Македонија'} · ${formatDate(product.created_at)}`}
                      price={`${product.price.toLocaleString()} ${product.currency || '€'}`}
                      image={product.images?.[0] || product.image_url}
                      images={product.images}
                      description={product.description}
                      createdAt={product.created_at}
                      views={product.views}
                      messageCount={messageCountsByProduct[product.id] || 0}
                      note={product.status === 'active' ? 'Активен' : product.status === 'pending' ? 'Во преглед' : product.status === 'rejected' ? 'Одбиен' : product.status || 'Оглас'}
                      status={product.status}
                      sellerName={user.name}
                      negotiable={product.negotiable}
                      onRefresh={() => refreshProduct(product.id)}
                      onEdit={() => editProduct(product.id)}
                      onDelete={() => deleteProduct(product.id)}
                      onPromote={() => promoteProduct(product.id)}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === 'saved' && (
            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-[17px] font-bold sm:text-xl">Зачувани огласи</h2>
                  <p className="mt-1 text-[13px] text-slate-400 sm:text-sm">Брз пристап до огласите што ги следиш.</p>
                </div>
                <span className="shrink-0 text-sm text-slate-400">{favorites.length} ставки</span>
              </div>

              {favorites.length === 0 ? (
                <EmptyState
                  title="Немаш зачувани огласи"
                  description="Кога ќе зачуваш оглас, тој ќе се појави тука за брз пристап."
                />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {favorites.slice(0, 9).map((product) => (
                    <MiniAdCard
                      key={product.id}
                      href={`/products/${product.id}`}
                      title={product.title}
                      meta={product.location || 'Македонија'}
                      price={`${product.price.toLocaleString()} ${product.currency || '€'}`}
                      image={product.image_url || product.images?.[0]}
                      note="Зачуван"
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === 'settings' && (
            <section className="grid gap-3 lg:grid-cols-[1fr_0.95fr]">
              <Card className="border-[#1d2c43] bg-[#0b1423] p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                  <h2 className="text-[17px] font-bold sm:text-xl">Основни податоци</h2>
                    <p className="mt-1 text-[13px] text-slate-400 sm:text-sm">Профил, контакт и јавен идентитет.</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] text-amber-300">
                    ID #{user.id}
                  </span>
                </div>

                <div className="mt-4 space-y-2.5 text-sm">
                  <InfoRow label="Име" value={user.name} />
                  <InfoRow label="Е-пошта" value={user.email} />
                  <InfoRow label="Телефон" value={user.phone || 'Не е внесен'} />
                  <InfoRow label="Локација" value={locationLabel} />
                  <InfoRow label="Член од" value={joinedLabel} />
                </div>
              </Card>

              <div className="space-y-3">
                <Card className="!rounded-[16px] border-[#1d2c43] bg-[#0b1423] p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-[15px] font-bold text-white sm:text-base">Безбедност</h3>
                      <p className="mt-1 text-[13px] text-slate-400 sm:text-sm">Клучните индикатори за сметката.</p>
                    </div>
                    <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  </div>

                  <div className="mt-4 space-y-2.5 text-sm text-slate-300">
                    <InfoRow
                      label="Лозинка"
                      value={
                        <span className="inline-flex items-center gap-1 font-medium text-white">
                          <Inbox className="h-4 w-4 text-sky-400" />
                          Заштитена
                        </span>
                      }
                    />
                    <InfoRow
                      label="Профил"
                      value={
                        <span className="inline-flex items-center gap-1 font-medium text-white">
                          <BadgeCheck className="h-4 w-4 text-emerald-400" />
                          Активен
                        </span>
                      }
                    />
                    <InfoRow label="Оценка" value={`${Number(user.rating || 5).toFixed(1)}/5`} />
                    <div className="rounded-xl border border-[#223653] bg-[#0b1727] px-4 py-2.5 text-xs leading-5 text-slate-400">
                      Следниот чекор може да биде уредување на профил и промена на лозинка.
                    </div>
                  </div>
                </Card>

                <Card className="!rounded-[16px] border-[#1d2c43] bg-[#0b1423] p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h3 className="text-[15px] font-bold text-white sm:text-base">Гледани огласи</h3>
                      <p className="mt-1 text-[13px] text-slate-400 sm:text-sm">Последни 7 дена.</p>
                    </div>
                    <Clock3 className="h-5 w-5 text-slate-400" />
                  </div>

                  <div className="mt-4 space-y-2">
                    {recentViewsByDay.map((day) => {
                      const width = `${Math.max((day.count / maxRecentViews) * 100, day.count > 0 ? 18 : 8)}%`;
                      return (
                        <div key={day.key} className="flex items-center gap-2">
                          <span className="w-7 shrink-0 text-[11px] text-slate-400">{day.label}</span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#081223]">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400"
                              style={{ width }}
                            />
                          </div>
                          <span className="w-4 shrink-0 text-right text-[11px] text-slate-300">{day.count}</span>
                        </div>
                      );
                    })}
                  </div>
                </Card>

              </div>
            </section>
          )}

          {activeTab === 'messages' && (
            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-[17px] font-bold sm:text-xl">Пораки</h2>
                  <p className="mt-1 text-[13px] text-slate-400 sm:text-sm">Преглед на сите разговори поврзани со твоите огласи.</p>
                </div>
                <span className="shrink-0 text-sm text-slate-400">{messages.length} разговори</span>
              </div>

              {messages.length === 0 ? (
                <EmptyState
                  title="Немаш пораки"
                  description="Кога некој ќе ти пише за оглас, пораката ќе се појави тука."
                />
              ) : (
                <div className="space-y-2.5">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className="rounded-[16px] border border-[#1d2c43] bg-[#0b1423] px-4 py-3 transition hover:border-[#2d4f7d] hover:bg-[#10203a]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-semibold text-white">
                              {message.sender_id === user.id ? message.receiver_name : message.sender_name}
                            </p>
                            {!message.read && <span className="h-2 w-2 rounded-full bg-red-500" />}
                          </div>
                          <p className="mt-1 truncate text-xs text-slate-400">{message.product_title}</p>
                        </div>
                        <span className="shrink-0 text-[11px] text-slate-500">{formatDate(message.created_at)}</span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-300">{message.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </Container>
    </div>
  );
}

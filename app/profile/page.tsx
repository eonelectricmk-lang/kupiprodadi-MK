'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Clock3,
  Heart,
  Inbox,
  LayoutGrid,
  MessageSquare,
  PenSquare,
  ShieldCheck,
  Star,
  UserCircle2,
} from 'lucide-react';
import { Header } from '@/app/components/Header';
import { Card, Container } from '@/app/components/ui';

type Product = {
  id: number;
  title: string;
  price: number;
  currency?: string;
  location?: string;
  category?: string;
  image_url?: string;
  images?: string[];
  created_at?: string;
  status?: string;
};

type Message = {
  id: number;
  sender_id: number;
  receiver_id: number;
  sender_name: string;
  receiver_name: string;
  content: string;
  product_title: string;
  read: boolean;
  created_at: string;
};

type Review = {
  id: number;
  from_user_name: string;
  rating: number;
  comment: string;
  created_at: string;
};

type Order = {
  id: number;
  title: string;
  quantity: number;
  total_price: number;
  created_at: string;
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

function formatDate(value?: string) {
  if (!value) return 'Денес';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Денес';
  return new Intl.DateTimeFormat('mk-MK', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
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

function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <Card className="border-[#1d2c43] bg-[#0b1423] p-5 text-center">
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-[#223653] bg-[#081223] text-slate-400">
        <AlertCircle className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </Card>
  );
}

function CompactRow({
  title,
  meta,
  price,
  image,
  href,
  rightNote,
}: {
  title: string;
  meta: string;
  price: string;
  image?: string | null;
  href: string;
  rightNote?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-2xl border border-[#1d2c43] bg-[#0f1a2b] p-2.5 transition hover:-translate-y-0.5 hover:border-[#2d4f7d] hover:bg-[#122038]"
    >
      <div className="h-12 w-12 overflow-hidden rounded-xl border border-[#223653] bg-[#081223]">
        <img
          src={image || 'https://picsum.photos/160/160?grayscale&blur=1'}
          alt={title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-white">{title}</p>
        <p className="mt-1 truncate text-xs text-slate-400">{meta}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-red-400">{price}</p>
        <p className="text-[11px] text-slate-500">{rightNote || 'Отвори'}</p>
      </div>
    </Link>
  );
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [recentViews, setRecentViews] = useState<RecentView[]>([]);
  const [loading, setLoading] = useState(true);

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
        const [adsRes, favRes, msgRes] = await Promise.all([
          fetch(`/api/products?seller_id=${userData.id}`),
          fetch(`/api/favorites?user_id=${userData.id}`),
          fetch(`/api/messages?user_id=${userData.id}`),
        ]);

        const [adsData, favData, msgData] = await Promise.all([
          adsRes.json(),
          favRes.json(),
          msgRes.json(),
        ]);

        setMyProducts(Array.isArray(adsData?.products) ? adsData.products : []);
        setFavorites(Array.isArray(favData) ? favData : []);
        setMessages(Array.isArray(msgData) ? msgData : []);
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

  const navItems = [
    { id: 'overview', label: 'Преглед', icon: LayoutGrid, count: myProducts.length + favorites.length },
    { id: 'ads', label: 'Мои огласи', icon: PenSquare, count: myProducts.length },
    { id: 'saved', label: 'Зачувани', icon: Heart, count: favorites.length },
    { id: 'messages', label: 'Пораки', icon: MessageSquare, count: messages.length },
    { id: 'recent', label: 'Последно гледани', icon: Clock3, count: recentViews.length },
    { id: 'settings', label: 'Профил', icon: UserCircle2, count: 2 },
  ];

  const heroStats = [
    { label: 'Огласи', value: myProducts.length, icon: PenSquare, accent: 'text-sky-400' },
    { label: 'Зачувани', value: favorites.length, icon: Heart, accent: 'text-pink-400' },
    { label: 'Пораки', value: messages.length, icon: MessageSquare, accent: 'text-amber-400' },
    { label: 'Прегледи', value: recentViews.length, icon: Clock3, accent: 'text-emerald-400' },
  ];

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
      <Container className="py-2.5 md:py-3">
        <section id="overview" className="rounded-3xl border border-[#1d2c43] bg-gradient-to-br from-[#081223] via-[#0b1423] to-[#07101c] p-2.5 shadow-2xl shadow-black/20 md:p-3">
          <div className="grid gap-3 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-stretch">
            <div className="flex min-w-0 items-center gap-2.5 rounded-2xl border border-[#223653] bg-[#081223] px-3 py-2.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#223653] bg-[#0b1727]">
                <UserCircle2 className="h-6 w-6 text-slate-300" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[16px] font-black tracking-tight">{user.name}</p>
                  <div className="flex shrink-0 items-center gap-1 text-[13px] text-slate-500">
                    <Star className="h-3.5 w-3.5 shrink-0 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-slate-300">{Number(user.rating || 5).toFixed(1)}</span>
                    <span>·</span>
                    <span className="font-medium text-slate-400">Активен</span>
                  </div>
                </div>
                <div className="mt-0.5 flex items-center justify-between gap-3 text-[13px] text-slate-400">
                  <p className="truncate">{user.email}</p>
                  <span className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[11px] text-amber-300">
                    ID #{user.id}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {heroStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-[#223653] bg-[#081223] px-2 py-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[16px] font-medium text-slate-400">{stat.label}</span>
                    <stat.icon className={`h-3.5 w-3.5 ${stat.accent}`} />
                  </div>
                  <p className="mt-0.5 text-[24px] font-black leading-none text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-3 grid gap-4 lg:grid-cols-[180px_1fr]">
          <aside className="self-start lg:sticky lg:top-28">
            <Card className="border-[#1d2c43] bg-[#0b1423] p-1.5">
              <div className="space-y-0.5">
                {navItems.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="flex items-center justify-between rounded-2xl px-2 py-1.5 text-xs text-slate-300 transition hover:bg-[#122038] hover:text-white"
                  >
                    <span className="inline-flex items-center gap-3">
                      <item.icon className="h-3.5 w-3.5 text-slate-400" />
                      {item.label}
                    </span>
                    <span className="rounded-full bg-[#081223] px-1.5 py-0.5 text-[10px] text-slate-400">{item.count}</span>
                  </a>
                ))}
              </div>
            </Card>

            <Card className="mt-3.5 border-[#1d2c43] bg-[#0b1423] p-2.5">
              <p className="text-sm font-semibold text-white">Брз преглед</p>
              <p className="mt-1.5 text-sm leading-6 text-slate-400">
                Тука ги гледаш огласите, зачуваните ставки и последно отворените производи.
              </p>
            </Card>

            <Card className="mt-3.5 border-[#1d2c43] bg-[#0b1423] p-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-white">Гледани огласи</p>
                <span className="text-[11px] text-slate-500">Последни 7 дена</span>
              </div>
              <div className="mt-3 space-y-2">
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
          </aside>

          <main className="space-y-5">
            <section id="ads">
              <div className="mb-2.5 flex items-center justify-between">
                <h2 className="text-lg font-bold sm:text-xl">Мои огласи</h2>
                <Link href="/sell" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white">
                  Нов оглас <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {myProducts.length === 0 ? (
                <EmptyState
                  title="Немаш огласи за сега"
                  description="Објави прв оглас и ќе се појави тука веднаш штом биде активен."
                  action={
                    <Link href="/sell" className="inline-flex rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700">
                      Објави прв оглас
                    </Link>
                  }
                />
              ) : (
                <div className="space-y-3">
                  {myProducts.slice(0, 4).map((product) => (
                    <CompactRow
                      key={product.id}
                      href={`/products/${product.id}`}
                      title={product.title}
                      meta={`${product.location || 'Македонија'} · ${product.status === 'active' ? 'Активен' : 'Во преглед'}`}
                      price={`${product.price.toLocaleString()} ${product.currency || '€'}`}
                      image={product.images?.[0] || product.image_url}
                      rightNote={formatDate(product.created_at)}
                    />
                  ))}
                </div>
              )}
            </section>

            <section id="saved">
              <div className="mb-2.5 flex items-center justify-between">
                <h2 className="text-lg font-bold sm:text-xl">Зачувани огласи</h2>
                <span className="text-sm text-slate-400">{favorites.length} ставки</span>
              </div>

              {favorites.length === 0 ? (
                <EmptyState
                  title="Немаш зачувани огласи"
                  description="Кога ќе зачуваш оглас, тој ќе се појави тука за брз пристап."
                />
              ) : (
                <div className="space-y-3">
                  {favorites.slice(0, 4).map((product) => (
                    <CompactRow
                      key={product.id}
                      href={`/products/${product.id}`}
                      title={product.title}
                      meta={product.location || 'Македонија'}
                      price={`${product.price.toLocaleString()} ${product.currency || '€'}`}
                      image={product.image_url || product.images?.[0]}
                      rightNote="Сачуван"
                    />
                  ))}
                </div>
              )}
            </section>

            <section id="messages">
              <div className="mb-2.5 flex items-center justify-between">
                <h2 className="text-lg font-bold sm:text-xl">Пораки</h2>
                <span className="text-sm text-slate-400">{unreadMessages} непрочитани</span>
              </div>

              {messages.length === 0 ? (
                <EmptyState title="Немаш пораки" description="Кога ќе добиеш нова порака, таа ќе се појави тука." />
              ) : (
                <div className="space-y-3">
                  {messages.slice(0, 4).map((message) => (
                    <Card key={message.id} className="border-[#1d2c43] bg-[#0b1423] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-white">
                            {message.sender_id === user.id ? message.receiver_name : message.sender_name}
                          </p>
                          <p className="text-sm text-slate-400">{message.product_title}</p>
                        </div>
                        {!message.read && <span className="mt-1 h-2.5 w-2.5 rounded-full bg-red-500" />}
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-300">{message.content}</p>
                      <p className="mt-3 text-xs text-slate-500">{formatDate(message.created_at)}</p>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            <section id="recent">
              <div className="mb-2.5 flex items-center justify-between">
                <h2 className="text-lg font-bold sm:text-xl">Последно гледани</h2>
                <span className="text-sm text-slate-400">{recentViews.length} ставки</span>
              </div>

              {recentViews.length === 0 ? (
                <EmptyState
                  title="Нема последно гледани"
                  description="Отвори неколку огласи и тие автоматски ќе се појават тука."
                />
              ) : (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {recentViews.slice(0, 6).map((item) => (
                    <Link
                      key={item.id}
                      href={`/products/${item.id}`}
                      className="group overflow-hidden rounded-2xl border border-[#1d2c43] bg-[#0f1a2b] transition hover:-translate-y-0.5 hover:border-[#2d4f7d]"
                    >
                      <div className="relative h-28 overflow-hidden">
                        <img
                          src={item.image_url || 'https://picsum.photos/640/480?grayscale&blur=1'}
                          alt={item.title}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-4">
                        <p className="line-clamp-2 text-sm font-semibold text-white">{item.title}</p>
                        <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                          <span>{item.location || 'Македонија'}</span>
                          <span>
                            {item.price.toLocaleString()} {item.currency || '€'}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            <section id="settings">
              <div className="mb-2.5 flex items-center justify-between">
                <h2 className="text-lg font-bold sm:text-xl">Профил и безбедност</h2>
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <Card className="border-[#1d2c43] bg-[#0b1423] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white">Основни податоци</p>
                    <span className="shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-300">
                      ID #{user.id}
                    </span>
                  </div>
                  <div className="mt-3 space-y-2.5 text-sm text-slate-300">
                    <div className="flex items-center justify-between gap-3 rounded-xl bg-[#081223] px-4 py-2.5">
                      <span className="text-slate-400">Име</span>
                      <span className="font-medium text-white">{user.name}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 rounded-xl bg-[#081223] px-4 py-2.5">
                      <span className="text-slate-400">Е-пошта</span>
                      <span className="font-medium text-white">{user.email}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 rounded-xl bg-[#081223] px-4 py-2.5">
                      <span className="text-slate-400">Телефон</span>
                      <span className="font-medium text-white">{user.phone || 'Не е внесен'}</span>
                    </div>
                  </div>
                </Card>

                <Card className="border-[#1d2c43] bg-[#0b1423] p-4">
                  <p className="text-sm font-semibold text-white">Безбедност</p>
                  <div className="mt-3 space-y-2.5 text-sm text-slate-300">
                    <div className="flex items-center justify-between rounded-xl bg-[#081223] px-4 py-2.5">
                      <span className="text-slate-400">Лозинка</span>
                      <span className="inline-flex items-center gap-1 font-medium text-white">
                        <Inbox className="h-4 w-4 text-sky-400" />
                        Заштитена
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-[#081223] px-4 py-2.5">
                      <span className="text-slate-400">Профил</span>
                      <span className="inline-flex items-center gap-1 font-medium text-white">
                        <BadgeCheck className="h-4 w-4 text-emerald-400" />
                        Активен
                      </span>
                    </div>
                    <div className="rounded-xl border border-[#223653] bg-[#0b1727] px-4 py-2.5 text-xs leading-5 text-slate-400">
                      Следниот чекор може да биде вистинско уредување на профил и промена на лозинка.
                    </div>
                  </div>
                </Card>
              </div>
            </section>

            <section id="notifications">
              <div className="mb-2.5 flex items-center justify-between">
                <h2 className="text-lg font-bold sm:text-xl">Активност</h2>
                <Clock3 className="h-5 w-5 text-slate-400" />
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <Card className="border-[#1d2c43] bg-[#0b1423] p-4">
                  <p className="text-sm text-slate-400">Прегледи денес</p>
                  <p className="mt-2 text-2xl font-black text-white">{recentViews.length}</p>
                </Card>
                <Card className="border-[#1d2c43] bg-[#0b1423] p-4">
                  <p className="text-sm text-slate-400">Мои огласи</p>
                  <p className="mt-2 text-2xl font-black text-white">{myProducts.length}</p>
                </Card>
                <Card className="border-[#1d2c43] bg-[#0b1423] p-4">
                  <p className="text-sm text-slate-400">Зачувани</p>
                  <p className="mt-2 text-2xl font-black text-white">{favorites.length}</p>
                </Card>
              </div>
            </section>
          </main>
        </div>
      </Container>
    </div>
  );
}

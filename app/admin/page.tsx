'use client';

import { useEffect, useState } from 'react';
import Header from '@/app/components/Header';
import { Button, Container, Input } from '@/app/components/ui';
import { slugify } from '@/lib/slugify';

type AdminMe = {
  authenticated: boolean;
  setupRequired: boolean;
  admin?: { id: number; name: string; email: string } | null;
};

type ProductRow = {
  id: number;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  subcategory: string | null;
  city: string | null;
  location: string | null;
  status: string;
  image_url: string | null;
  images: string[];
  seller_name: string;
  seller_email: string;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  delivery: string | null;
  condition: string | null;
  created_at: string;
};

type CategoryNode = {
  id: number;
  name: string;
  slug: string;
  icon: string;
  subcategories: Array<{ id: number; name: string; slug: string }>;
};

type BannerRow = {
  id: number;
  image_url: string;
  link_url: string | null;
  sort_order: number;
  is_active: number;
  created_at: string;
};

const TABS = [
  { id: 'products', label: 'Огласи' },
  { id: 'categories', label: 'Категории' },
  { id: 'banners', label: 'Банери' },
] as const;

const CATEGORY_ICON_OPTIONS = [
  { value: 'car', label: 'Автомобил' },
  { value: 'house', label: 'Куќа / дом' },
  { value: 'sofa', label: 'Софа / дом и градина' },
  { value: 'shirt', label: 'Облека / мода' },
  { value: 'smartphone', label: 'Мобилен телефон' },
  { value: 'monitor', label: 'Компјутер / монитор' },
  { value: 'tv', label: 'Телевизор / видео' },
  { value: 'guitar', label: 'Гитара / музика' },
  { value: 'watch', label: 'Часовник' },
  { value: 'baby', label: 'Бебе / деца' },
  { value: 'heart', label: 'Здравје / убавина' },
  { value: 'disc', label: 'CD / DVD' },
  { value: 'book', label: 'Книги' },
  { value: 'paperclip', label: 'Канцеларија / училиште' },
  { value: 'gamepad', label: 'Хоби / игри' },
  { value: 'dumbbell', label: 'Спорт' },
  { value: 'palette', label: 'Уметност' },
  { value: 'briefcase', label: 'Бизнис' },
  { value: 'cooking', label: 'Готвење / храна' },
  { value: 'cart', label: 'Трговија' },
  { value: 'wrench', label: 'Алат / услуги' },
  { value: 'calendar', label: 'Настани' },
  { value: 'plane', label: 'Туризам' },
  { value: 'message', label: 'Контакти / пораки' },
  { value: 'package', label: 'Останато / пакет' },
] as const;

export default function AdminPage() {
  const [me, setMe] = useState<AdminMe | null>(null);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['id']>('products');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [banners, setBanners] = useState<BannerRow[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [login, setLogin] = useState({ email: '', password: '' });
  const [setup, setSetup] = useState({ name: '', email: '', password: '', phone: '' });
  const [newCategory, setNewCategory] = useState({ name: '', slug: '', icon: 'layout-grid' });
  const [newSubcategory, setNewSubcategory] = useState({ parentId: '', name: '', slug: '' });
  const [categorySlugTouched, setCategorySlugTouched] = useState(false);
  const [subcategorySlugTouched, setSubcategorySlugTouched] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<number | null>(null);
  const [bannerForm, setBannerForm] = useState({
    image_url: '',
    link_url: '',
    sort_order: '',
    is_active: true,
  });

  const refreshMe = async () => {
    const response = await fetch('/api/admin/me', { cache: 'no-store' });
    const data = await response.json();
    setMe(data);
    return data;
  };

  const refreshProducts = async (nextStatus = statusFilter) => {
    const response = await fetch(`/api/admin/products?status=${encodeURIComponent(nextStatus)}`, { cache: 'no-store' });
    const data = await response.json();
    setProducts(Array.isArray(data?.products) ? data.products : []);
  };

  const refreshCategories = async () => {
    const response = await fetch('/api/categories?all=1', { cache: 'no-store' });
    const data = await response.json();
    setCategories(Array.isArray(data?.categories) ? data.categories : []);
  };

  const refreshBanners = async () => {
    const response = await fetch('/api/admin/banners', { cache: 'no-store' });
    const data = await response.json();
    setBanners(Array.isArray(data?.banners) ? data.banners : []);
  };

  useEffect(() => {
    refreshMe().catch(() => setMe({ authenticated: false, setupRequired: false }));
  }, []);

  useEffect(() => {
    if (!me?.authenticated) return;
    refreshProducts().catch(() => {});
    refreshCategories().catch(() => {});
    refreshBanners().catch(() => {});
  }, [me?.authenticated]);

  useEffect(() => {
    if (!me?.authenticated || activeTab !== 'products') return;
    refreshProducts(statusFilter).catch(() => {});
  }, [statusFilter, activeTab, me?.authenticated]);

  const submitSetup = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(setup),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Не успеа setup');
      await refreshMe();
      setMessage('Admin профилот е креиран и најавен.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Грешка при setup.');
    } finally {
      setBusy(false);
    }
  };

  const submitLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(login),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Не успеа најавата');
      await refreshMe();
      setMessage('Успешна admin најава.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Грешка при најава.');
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setProducts([]);
    setCategories([]);
    setBanners([]);
    await refreshMe();
  };

  const changeProductStatus = async (id: number, status: string) => {
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Не успеа менување статус');
      await refreshProducts(statusFilter);
      setMessage(`Огласот е сменет во ${status}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Грешка при менување статус.');
    } finally {
      setBusy(false);
    }
  };

  const createCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Не успеа додавање категорија');
      setNewCategory({ name: '', slug: '', icon: 'layout-grid' });
      setCategorySlugTouched(false);
      await refreshCategories();
      setMessage('Категоријата е додадена.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Грешка при додавање категорија.');
    } finally {
      setBusy(false);
    }
  };

  const createSubcategory = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentId: Number(newSubcategory.parentId),
          name: newSubcategory.name,
          slug: newSubcategory.slug,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Не успеа додавање подкатегорија');
      setNewSubcategory({ parentId: '', name: '', slug: '' });
      setSubcategorySlugTouched(false);
      await refreshCategories();
      setMessage('Подкатегоријата е додадена.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Грешка при додавање подкатегорија.');
    } finally {
      setBusy(false);
    }
  };

  const toggleCategory = async (id: number, isActive: boolean) => {
    setBusy(true);
    try {
      await fetch(`/api/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });
      await refreshCategories();
    } finally {
      setBusy(false);
    }
  };

  const deleteCategory = async (id: number) => {
    setBusy(true);
    try {
      await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      await refreshCategories();
    } finally {
      setBusy(false);
    }
  };

  const resetBannerForm = () => {
    setEditingBannerId(null);
    setBannerForm({
      image_url: '',
      link_url: '',
      sort_order: '',
      is_active: true,
    });
  };

  const handleBannerImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

    setBannerForm((prev) => ({ ...prev, image_url: dataUrl }));
    event.target.value = '';
  };

  const submitBanner = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const url = editingBannerId ? `/api/admin/banners/${editingBannerId}` : '/api/admin/banners';
      const method = editingBannerId ? 'PATCH' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: bannerForm.image_url,
          link_url: bannerForm.link_url,
          sort_order: bannerForm.sort_order === '' ? undefined : Number(bannerForm.sort_order),
          is_active: bannerForm.is_active,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Не успеа зачувување банер');
      await refreshBanners();
      resetBannerForm();
      setMessage(editingBannerId ? 'Банерот е ажуриран.' : 'Банерот е додаден.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Грешка при зачувување банер.');
    } finally {
      setBusy(false);
    }
  };

  const startEditBanner = (banner: BannerRow) => {
    setEditingBannerId(banner.id);
    setBannerForm({
      image_url: banner.image_url,
      link_url: banner.link_url || '',
      sort_order: String(banner.sort_order),
      is_active: Boolean(banner.is_active),
    });
    setActiveTab('banners');
    setMessage(null);
  };

  const toggleBannerActive = async (banner: BannerRow) => {
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/banners/${banner.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...banner,
          is_active: !banner.is_active,
          image_url: banner.image_url,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Не успеа промена на банер');
      await refreshBanners();
      setMessage(!banner.is_active ? 'Банерот е активиран.' : 'Банерот е сокриен.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Грешка при менување банер.');
    } finally {
      setBusy(false);
    }
  };

  const deleteBanner = async (id: number) => {
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Не успеа бришење банер');
      if (editingBannerId === id) resetBannerForm();
      await refreshBanners();
      setMessage('Банерот е избришан.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Грешка при бришење банер.');
    } finally {
      setBusy(false);
    }
  };

  const handleCategoryNameChange = (value: string) => {
    setNewCategory((prev) => ({
      ...prev,
      name: value,
      slug: categorySlugTouched ? prev.slug : slugify(value),
    }));
  };

  const handleSubcategoryNameChange = (value: string) => {
    setNewSubcategory((prev) => ({
      ...prev,
      name: value,
      slug: subcategorySlugTouched ? prev.slug : slugify(value),
    }));
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#050b17] py-8 text-white">
        <Container>
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Admin Panel</h1>
              <p className="mt-2 text-sm text-slate-400">Од тука ќе одобруваш огласи и ќе управуваш со категории и банери.</p>
            </div>
            {me?.authenticated && (
              <Button onClick={logout} className="admin-dark-button bg-slate-700 hover:bg-slate-600 text-white">
                Одјава
              </Button>
            )}
          </div>

          {message && (
            <div className="mb-5 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-100">
              {message}
            </div>
          )}

          {!me?.authenticated && me?.setupRequired && (
            <form onSubmit={submitSetup} className="max-w-xl space-y-4 rounded-xl border border-[#1d2c43] bg-[#081223] p-6">
              <h2 className="text-xl font-bold">Постави прв admin</h2>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-200">Admin име</label>
                <Input placeholder="на пр. Admin" value={setup.name} onChange={(e) => setSetup((prev) => ({ ...prev, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-200">Admin email</label>
                <Input placeholder="на пр. admin@kupiprodadi.mk" type="email" value={setup.email} onChange={(e) => setSetup((prev) => ({ ...prev, email: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-200">Лозинка</label>
                <Input placeholder="Внеси сигурна лозинка" type="password" value={setup.password} onChange={(e) => setSetup((prev) => ({ ...prev, password: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-200">Телефон</label>
                <Input placeholder="на пр. 070123456" value={setup.phone} onChange={(e) => setSetup((prev) => ({ ...prev, phone: e.target.value }))} />
              </div>
              <Button disabled={busy} className="admin-dark-button bg-red-600 hover:bg-red-700 text-white">{busy ? 'Се креира...' : 'Креирај admin'}</Button>
            </form>
          )}

          {!me?.authenticated && !me?.setupRequired && (
            <form onSubmit={submitLogin} className="max-w-xl space-y-4 rounded-xl border border-[#1d2c43] bg-[#081223] p-6">
              <h2 className="text-xl font-bold">Admin најава</h2>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-200">Admin email</label>
                <Input placeholder="на пр. admin@kupiprodadi.mk" type="email" value={login.email} onChange={(e) => setLogin((prev) => ({ ...prev, email: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-200">Лозинка</label>
                <Input placeholder="Внеси лозинка" type="password" value={login.password} onChange={(e) => setLogin((prev) => ({ ...prev, password: e.target.value }))} />
              </div>
              <Button disabled={busy} className="admin-dark-button bg-red-600 hover:bg-red-700 text-white">{busy ? 'Најава...' : 'Најави се'}</Button>
            </form>
          )}

          {me?.authenticated && (
            <div className="space-y-5">
              <div className="flex gap-2">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`admin-dark-button rounded-lg px-4 py-2 text-sm font-semibold ${activeTab === tab.id ? 'bg-red-600 text-white' : 'bg-[#0c1628] text-slate-300'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === 'products' && (
                <section className="rounded-xl border border-[#1d2c43] bg-[#081223] p-5">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <h2 className="text-xl font-bold">Одобрување огласи</h2>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="rounded-lg border border-[#223653] bg-[#0b1727] px-3 py-2 text-sm text-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    {products.map((product) => (
                      <div key={product.id} className="rounded-lg border border-[#1d2c43] bg-[#0b1727] p-4">
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                              <h3 className="text-lg font-semibold">{product.title}</h3>
                              <p className="mt-1 text-sm text-slate-300">
                                {product.seller_name} · {product.contact_name || 'Нема контакт име'} · {product.contact_phone || 'Нема телефон'}
                              </p>
                              <p className="mt-1 text-sm text-slate-400">
                                {product.price} {product.currency} · {product.city || product.location || 'Нема град'} · {product.category}{product.subcategory ? ` / ${product.subcategory}` : ''}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {product.condition || 'Нема состојба'} · {product.delivery || 'Нема достава'} · {product.contact_email || product.seller_email}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={() => changeProductStatus(product.id, 'active')} className="admin-dark-button bg-green-600 hover:bg-green-500 text-white">Одобри</Button>
                              <Button onClick={() => changeProductStatus(product.id, 'rejected')} className="admin-dark-button bg-red-700 hover:bg-red-600 text-white">Одбиј</Button>
                              {product.status !== 'pending' && (
                                <Button onClick={() => changeProductStatus(product.id, 'pending')} className="admin-dark-button bg-slate-700 hover:bg-slate-600 text-white">Врати pending</Button>
                              )}
                            </div>
                          </div>

                          {product.description && (
                            <div className="rounded-lg border border-[#223653] bg-[#081223] p-4">
                              <p className="whitespace-pre-wrap text-sm leading-6 text-slate-200">{product.description}</p>
                            </div>
                          )}

                          {product.images?.length > 0 && (
                            <div className="flex flex-wrap gap-3">
                              {product.images.map((image, index) => (
                                <a key={`${product.id}-${index}`} href={image} target="_blank" rel="noopener noreferrer" className="block">
                                  <img
                                    src={image}
                                    alt={`${product.title} ${index + 1}`}
                                    className="h-28 w-36 rounded-lg border border-[#223653] bg-[#081223] object-cover"
                                  />
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {products.length === 0 && <p className="text-sm text-slate-400">Нема огласи во овој статус.</p>}
                  </div>
                </section>
              )}

              {activeTab === 'categories' && (
                <section className="grid gap-5 lg:grid-cols-[360px_1fr]">
                  <div className="space-y-5">
                    <form onSubmit={createCategory} className="rounded-xl border border-[#1d2c43] bg-[#081223] p-5 space-y-3">
                      <h2 className="text-lg font-bold">Нова категорија</h2>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-200">Име</label>
                        <Input placeholder="на пр. Електрични возила" value={newCategory.name} onChange={(e) => handleCategoryNameChange(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-200">Slug</label>
                        <Input
                          placeholder="се пополнува автоматски, на пр. elektricni-vozila"
                          value={newCategory.slug}
                          onChange={(e) => {
                            setCategorySlugTouched(true);
                            setNewCategory((prev) => ({ ...prev, slug: slugify(e.target.value) }));
                          }}
                        />
                        <p className="text-xs text-slate-400">Ова е адресата во линкот. Системот сам го прави од името, а можеш и рачно да го смениш.</p>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-200">Икона</label>
                        <select
                          value={newCategory.icon}
                          onChange={(e) => setNewCategory((prev) => ({ ...prev, icon: e.target.value }))}
                          className="h-11 w-full rounded-lg border border-[#223653] bg-[#0b1727] px-3 text-sm text-white"
                        >
                          <option value="layout-grid">Основна икона</option>
                          {CATEGORY_ICON_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                        <p className="text-xs text-slate-400">Избери ја иконата што најмногу одговара на категоријата.</p>
                      </div>
                      <Button disabled={busy} className="admin-dark-button bg-red-600 hover:bg-red-700 text-white">Додај категорија</Button>
                    </form>

                    <form onSubmit={createSubcategory} className="rounded-xl border border-[#1d2c43] bg-[#081223] p-5 space-y-3">
                      <h2 className="text-lg font-bold">Нова подкатегорија</h2>
                      <select
                        value={newSubcategory.parentId}
                        onChange={(e) => setNewSubcategory((prev) => ({ ...prev, parentId: e.target.value }))}
                        className="h-11 w-full rounded-lg border border-[#223653] bg-[#0b1727] px-3 text-sm text-white"
                      >
                        <option value="">Избери parent категорија</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-200">Име</label>
                        <Input placeholder="на пр. Скутери електрични" value={newSubcategory.name} onChange={(e) => handleSubcategoryNameChange(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-200">Slug</label>
                        <Input
                          placeholder="се пополнува автоматски, на пр. skuteri-elektricni"
                          value={newSubcategory.slug}
                          onChange={(e) => {
                            setSubcategorySlugTouched(true);
                            setNewSubcategory((prev) => ({ ...prev, slug: slugify(e.target.value) }));
                          }}
                        />
                        <p className="text-xs text-slate-400">Исто како категоријата, ова е URL името за подкатегоријата.</p>
                      </div>
                      <Button disabled={busy} className="admin-dark-button bg-red-600 hover:bg-red-700 text-white">Додај подкатегорија</Button>
                    </form>
                  </div>

                  <div className="rounded-xl border border-[#1d2c43] bg-[#081223] p-5">
                    <h2 className="mb-4 text-lg font-bold">Постоечки категории</h2>
                    <div className="space-y-4">
                      {categories.map((category) => (
                        <div key={category.id} className="rounded-lg border border-[#223653] bg-[#0b1727] p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <h3 className="font-semibold">{category.name}</h3>
                              <p className="text-sm text-slate-400">{category.slug}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={() => toggleCategory(category.id, false)} className="admin-dark-button bg-slate-700 hover:bg-slate-600 text-white">Сокриј</Button>
                              <Button onClick={() => deleteCategory(category.id)} className="admin-dark-button bg-red-700 hover:bg-red-600 text-white">Избриши</Button>
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {category.subcategories.map((subcategory) => (
                              <span key={subcategory.id} className="rounded-full border border-[#2c4264] bg-[#122038] px-3 py-1 text-xs text-slate-200">
                                {subcategory.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {activeTab === 'banners' && (
                <section className="grid gap-5 lg:grid-cols-[420px_1fr]">
                  <div className="space-y-5">
                    <form onSubmit={submitBanner} className="rounded-xl border border-[#1d2c43] bg-[#081223] p-5 space-y-4">
                      <div>
                        <h2 className="text-lg font-bold">{editingBannerId ? 'Уреди банер' : 'Нов главен банер'}</h2>
                        <p className="mt-1 text-sm text-slate-400">Препорачана димензија: 1600 x 400 px, JPG или PNG. Банерите се image-only, без посебен текст од системот.</p>
                        <p className="mt-1 text-xs text-slate-500">Правило: минимум 1 активен банер, максимум 10 активни банери.</p>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-200">Upload слика *</label>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={handleBannerImageChange}
                          className="block w-full text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-red-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-red-700"
                        />
                        <Input
                          placeholder="или стави директен image URL"
                          value={bannerForm.image_url}
                          onChange={(e) => setBannerForm((prev) => ({ ...prev, image_url: e.target.value }))}
                        />
                      </div>

                      {bannerForm.image_url && (
                        <div className="overflow-hidden rounded-lg border border-[#223653] bg-[#0b1727]">
                          <img src={bannerForm.image_url} alt="Preview банер" className="h-32 w-full object-cover" />
                        </div>
                      )}

                      <Input placeholder="Линк кога ќе се кликне, на пр. /products?category=motorni-vozila (опционално)" value={bannerForm.link_url} onChange={(e) => setBannerForm((prev) => ({ ...prev, link_url: e.target.value }))} />
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-200">Редослед на банер</label>
                        <Input placeholder="на пр. 0 = прв, 1 = втор, 2 = трет" value={bannerForm.sort_order} onChange={(e) => setBannerForm((prev) => ({ ...prev, sort_order: e.target.value }))} />
                        <p className="text-xs text-slate-400">Колку е помал бројот, толку порано ќе се прикаже банерот на почетна.</p>
                      </div>

                      <label className="flex items-center gap-3 rounded-lg border border-[#223653] bg-[#0b1727] px-4 py-3 text-sm text-slate-200">
                        <input
                          type="checkbox"
                          checked={bannerForm.is_active}
                          onChange={(e) => setBannerForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                        />
                        Банерот да биде активен и видлив на почетна
                      </label>

                      <div className="flex gap-2">
                        <Button disabled={busy} className="admin-dark-button bg-red-600 hover:bg-red-700 text-white">
                          {editingBannerId ? 'Зачувај измени' : 'Додај банер'}
                        </Button>
                        {editingBannerId && (
                          <Button type="button" onClick={resetBannerForm} className="admin-dark-button bg-slate-700 hover:bg-slate-600 text-white">
                            Откажи
                          </Button>
                        )}
                      </div>
                    </form>
                  </div>

                  <div className="rounded-xl border border-[#1d2c43] bg-[#081223] p-5">
                    <h2 className="mb-4 text-lg font-bold">Постоечки банери</h2>
                    <div className="space-y-4">
                      {banners.map((banner) => (
                        <div key={banner.id} className="rounded-lg border border-[#223653] bg-[#0b1727] p-4">
                          <div className="flex flex-col gap-4 xl:flex-row">
                            <div className="overflow-hidden rounded-lg border border-[#223653] bg-[#081223] xl:w-[320px]">
                              <img src={banner.image_url} alt={`Банер ${banner.id}`} className="h-28 w-full object-cover" />
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                  <h3 className="text-lg font-semibold">Главен банер #{banner.id}</h3>
                                  <p className="mt-2 text-xs text-slate-500">Редослед: {banner.sort_order} · {banner.is_active ? 'Активен' : 'Скриен'}</p>
                                  {banner.link_url && <p className="mt-1 text-xs text-slate-500">Линк: {banner.link_url}</p>}
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <Button type="button" onClick={() => startEditBanner(banner)} className="admin-dark-button bg-slate-700 hover:bg-slate-600 text-white">Уреди</Button>
                                  <Button type="button" onClick={() => toggleBannerActive(banner)} className="admin-dark-button bg-emerald-700 hover:bg-emerald-600 text-white">
                                    {banner.is_active ? 'Сокриј' : 'Активирај'}
                                  </Button>
                                  <Button type="button" onClick={() => deleteBanner(banner.id)} className="admin-dark-button bg-red-700 hover:bg-red-600 text-white">Избриши</Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {banners.length === 0 && <p className="text-sm text-slate-400">Сè уште нема банери.</p>}
                    </div>
                  </div>
                </section>
              )}
            </div>
          )}
        </Container>
      </main>
    </>
  );
}

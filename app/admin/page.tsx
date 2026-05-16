'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import { Button, Container, Input } from '@/app/components/ui';
import { Check, Trash2, X } from 'lucide-react';
import { useTheme } from '@/app/context/ThemeContext';
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
  seller_id: number;
  seller_name: string;
  seller_email: string;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  delivery: string | null;
  condition: string | null;
  negotiable?: number | boolean;
  trade_possible?: number | boolean;
  has_viber?: number | boolean;
  has_whatsapp?: number | boolean;
  has_telegram?: number | boolean;
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

type UserRow = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  location: string | null;
  role: string;
  rating: number;
  reviews_count: number;
  created_at: string;
  is_active: number;
  ads_count: number;
};

type AdminComposeTarget = {
  id: number;
  name: string;
  email: string;
  is_active: number;
};

type AdminUserMessage = {
  id: number;
  sender_id: number;
  receiver_id: number;
  product_id: number | null;
  content: string;
  read: number;
  created_at: string;
  sender_name: string | null;
  receiver_name: string | null;
  product_title: string | null;
};

type HomepageTrustItem = {
  icon: 'shield-check' | 'badge-check' | 'zap' | 'users';
  color: string;
  title: string;
  subtitle: string;
};

type HomepageSectionsState = {
  headerCategorySlugs: string[];
  trustItems: HomepageTrustItem[];
  homeCategorySlugs: string[];
};

const TABS = [
  { id: 'products', label: 'Огласи' },
  { id: 'users', label: 'Корисници' },
  { id: 'categories', label: 'Категории' },
  { id: 'homepage', label: 'Уредување банери' },
  { id: 'banners', label: 'Голем банер' },
  { id: 'crm-drafts', label: 'Преземени' },
  { id: 'crm-published', label: 'Објавени' },
  { id: 'reports', label: 'Пријавени' },
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

function viberUrl(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('389')) return `viber://chat?number=%2B${digits}`;
  if (digits.startsWith('0')) return `viber://chat?number=%2B389${digits.slice(1)}`;
  return `viber://chat?number=%2B389${digits}`;
}

function ViberButton({ phone }: { phone: string }) {
  const url = viberUrl(phone);
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" title="Отвори во Viber" className="ml-28">
      <span className="inline-flex items-center gap-0.5 rounded bg-purple-700/70 px-1.5 py-0.5 text-xs font-semibold text-[#fff] hover:bg-purple-600 transition cursor-pointer">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current text-purple-300"><path d="M11.4 1.02c.35-.01.72 0 1.08.02 3.58.12 6.88 1.62 9.27 4.3a12.8 12.8 0 0 1 2.17 3.4c1.42 3.36 1.2 7.2-.6 10.38a12.56 12.56 0 0 1-2.16 3.02c-2.44 2.52-5.82 3.96-9.48 3.86-1.17-.04-2.32-.2-3.44-.52-1.2-.34-2.35-.8-3.44-1.38L.7 23.8l1.85-4.5a12.82 12.82 0 0 1-1.3-3.08 12.82 12.82 0 0 1-.22-5.55A12.6 12.6 0 0 1 5.55 2.9 12.49 12.49 0 0 1 11.4 1.02zm.34 4.05c-.14.03-.28.1-.35.22-.14.22-.15.5-.02.72.17.3.33.6.54.87.58.82 1.3 1.53 2.13 2.1.32.23.67.43 1.03.58.22.1.48.07.67-.07.24-.17.32-.5.19-.77a.57.57 0 0 0-.2-.23c-.44-.36-.85-.76-1.22-1.2-.3-.35-.56-.73-.77-1.14-.14-.27-.46-.46-.77-.4a.44.44 0 0 0-.23.15.4.4 0 0 0-.1.11zm-.12 2.4c-.02 0-.05 0-.07.02-.3.07-.55.3-.6.6-.07.37.18.73.56.8.07.02.14.05.2.1.3.2.58.42.84.66.25.26.48.54.68.84.1.16.26.28.44.3.22.03.44-.05.58-.22.17-.2.2-.49.07-.72a6.9 6.9 0 0 0-1.14-1.5 6.8 6.8 0 0 0-1.2-.88.44.44 0 0 0-.24-.07zm-1.56.36c-.18.03-.34.18-.38.37a.54.54 0 0 0 .23.58c.67.45 1.26 1 1.74 1.65.27.36.5.76.68 1.18.06.16.2.28.37.3.22.03.43-.08.54-.27.14-.22.12-.51-.04-.7a7.2 7.2 0 0 0-2.27-1.9.54.54 0 0 0-.31-.08zm-1.1.37c-.14.02-.28.1-.37.23-.15.22-.14.51.02.72.46.58.8 1.24 1.03 1.94.1.3.4.5.72.43.32-.06.53-.38.48-.7-.16-.82-.51-1.59-1.02-2.25a.63.63 0 0 0-.47-.26.5.5 0 0 0-.1-.01zm3.06 2.07c-.27.04-.54.22-.67.48-.16.32-.05.7.26.9.07.05.14.1.2.16a4.1 4.1 0 0 1 1 1.31c.1.2.3.34.53.34.25 0 .48-.14.57-.38.1-.27.02-.58-.2-.76a6 6 0 0 0-1.17-.9.73.73 0 0 0-.31-.1.67.67 0 0 0-.2-.04z"/></svg>
                        <span>Viber</span>
                      </span>
    </a>
  );
}

interface CrmDraft {
  id: number; title: string; description: string; price: string; city: string;
  category: string; subcategory?: string; seller_name: string; phone: string; images: string;
  source: string; source_url: string; notes: string; product_id: number | null;
  status: string; created_at: string;
}

interface ImprtProduct {
  id: number; title: string; price: number; status: string; url: string;
}

function CrmDraftsTab() {
  const [drafts, setDrafts] = useState<CrmDraft[]>([]);
  const [publishing, setPublishing] = useState<number | null>(null);
  const [editCat, setEditCat] = useState<Record<number, { category: string; subcategory: string }>>({});
  const [catOpts, setCatOpts] = useState<Array<{ name: string; slug: string; subcategories: Array<{ name: string; slug: string }> }>>([]);
  const [copiedTemplate, setCopiedTemplate] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => {
      if (Array.isArray(d?.categories)) setCatOpts(d.categories);
    }).catch(() => {});
  }, []);

  const remapDraftCategories = (draftsList: CrmDraft[], categoryOptions: typeof catOpts) => {
    const catNames = categoryOptions.map(c => c.name);
    const map: Record<number, { category: string; subcategory: string }> = {};
    for (const dr of draftsList) {
      const parts = (dr.category || '').split(/\s*\/\s*/).map((s: string) => s.trim()).filter(Boolean);
      let match = parts[0] ? catNames.find(c => c.toLowerCase().startsWith(parts[0].toLowerCase().slice(0, 8))) : undefined;
      match = match || (parts[0] && catNames.includes(parts[0]) ? parts[0] : undefined);
      const subName = parts.length > 1 ? parts[1] : '';
      const matchedCat = categoryOptions.find(c => c.name === match);
      const matchedSub = matchedCat?.subcategories.find(s => s.name.toLowerCase() === subName.toLowerCase());
      map[dr.id] = { category: match || '', subcategory: matchedSub ? matchedSub.slug : '' };
    }
    setEditCat(map);
  };

  const loadDrafts = async () => {
    try {
      const r = await fetch('/api/crm/drafts?status=draft');
      const d = await r.json();
      setDrafts(d.drafts || []);
      if (catOpts.length > 0) remapDraftCategories(d.drafts || [], catOpts);
    } catch {}
  };

  useEffect(() => { loadDrafts(); }, []);

  useEffect(() => {
    if (catOpts.length > 0 && drafts.length > 0) remapDraftCategories(drafts, catOpts);
  }, [catOpts]);

  const deleteDraft = async (id: number) => {
    if (!confirm('Избриши го?')) return;
    try {
      await fetch(`/api/crm/drafts/${id}`, { method: 'DELETE' });
      loadDrafts();
    } catch {}
  };

  const publishDraft = async (id: number, category: string, subcategory: string) => {
    if (!category) { alert('Избери категорија!'); return; }
    if (!subcategory) { alert('Избери подкатегорија!'); return; }
    setPublishing(id);
    try {
      const r = await fetch(`/api/crm/drafts/${id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, subcategory }),
      });
      const data = await r.json();
      if (r.ok) {
        loadDrafts();
      } else {
        alert(data.error || 'Грешка при објавување');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setPublishing(null);
    }
  };

  const draftImages = (draft: CrmDraft): string[] => {
    try { return JSON.parse(draft.images); } catch { return []; }
  };

  const startEdit = (draft: CrmDraft) => {
    const currentImages = draftImages(draft);
    setEditId(draft.id);
    setEditForm({
      title: draft.title,
      description: draft.description,
      price: draft.price,
      category: draft.category,
      subcategory: '',
      seller_name: draft.seller_name || '',
      phone: draft.phone || '',
      city: draft.city || '',
      images: JSON.stringify(currentImages),
    });
  };

  const removeEditableImage = (index: number) => {
    const imgs: string[] = JSON.parse(editForm.images || '[]');
    imgs.splice(index, 1);
    setEditForm(p => ({ ...p, images: JSON.stringify(imgs) }));
  };

  const saveEdit = async (draft: CrmDraft) => {
    const imgs: string[] = JSON.parse(editForm.images || '[]');
    try {
      await fetch(`/api/crm/drafts/${draft.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
          price: editForm.price,
          category: editForm.category,
          seller_name: editForm.seller_name,
          phone: editForm.phone,
          city: editForm.city,
          images: imgs,
        }),
      });
      setEditId(null);
      loadDrafts();
    } catch {}
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditForm({});
  };

  return (
    <div className="rounded-xl border border-[#2a3f55] bg-[#081223] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-amber-400">📋 Преземени огласи</h2>
        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="🔍 Пребарај..." className="w-72 rounded border border-[#2a3f55] bg-[#0b1727] px-3 py-1.5 text-sm text-white placeholder:text-slate-500" />
      </div>
      {drafts.length === 0 && !searchQuery && <p className="text-sm text-slate-400">Нема преземени огласи. Испрати преку extension-от.</p>}
      <div className="space-y-3">
        {drafts.filter(d => {
          if (!searchQuery) return true;
          const q = searchQuery.toLowerCase();
          return d.phone?.toLowerCase().includes(q) || d.seller_name?.toLowerCase().includes(q) || d.title?.toLowerCase().includes(q);
        }).map((draft) => {
          const ec = editCat[draft.id] || { category: '', subcategory: '' };
          const editing = editId === draft.id;
          const ef = editForm;
          return (
          <div key={draft.id} className="rounded-lg border-2 border-[#2a3f55] bg-[#0b1727] px-4 py-3">
            {editing ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input value={ef.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))} className="flex-1 rounded border border-[#2a3f55] bg-[#0b1727] px-2 py-1 text-sm text-white" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input value={ef.price} onChange={e => setEditForm(p => ({ ...p, price: e.target.value }))} className="rounded border border-[#2a3f55] bg-[#0b1727] px-2 py-1 text-sm text-white" placeholder="Цена" />
                  <input value={ef.city} onChange={e => setEditForm(p => ({ ...p, city: e.target.value }))} className="rounded border border-[#2a3f55] bg-[#0b1727] px-2 py-1 text-sm text-white" placeholder="Град" />
                  <input value={ef.seller_name} onChange={e => setEditForm(p => ({ ...p, seller_name: e.target.value }))} className="rounded border border-[#2a3f55] bg-[#0b1727] px-2 py-1 text-sm text-white" placeholder="Продавач" />
                  <input value={ef.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} className="rounded border border-[#2a3f55] bg-[#0b1727] px-2 py-1 text-sm text-white" placeholder="Телефон" />
                </div>
                <textarea value={ef.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full rounded border border-[#2a3f55] bg-[#0b1727] px-2 py-1 text-sm text-white" placeholder="Опис" />
                {(JSON.parse(ef.images || '[]') as string[]).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {(JSON.parse(ef.images || '[]') as string[]).map((url, i) => (
                      <div key={i} className="relative group">
                        <img src={url} className="h-20 w-20 rounded object-cover border border-[#2a3f55]" />
                        <button onClick={() => removeEditableImage(i)} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 text-white text-xs leading-none hover:bg-red-500">✕</button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => saveEdit(draft)} className="rounded px-3 py-1 text-sm bg-emerald-700 hover:bg-emerald-600 text-white font-semibold">Зачувај</button>
                  <button onClick={cancelEdit} className="rounded px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 text-white">Откажи</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-bold text-white truncate">{draft.title}</span>
                      {draft.phone && <ViberButton phone={draft.phone} />}
                      {[1, 2, 3].map((t) => (
                        <button
                          key={t}
                          onClick={() => {
                            navigator.clipboard.writeText(templateMsg(draft.title, t - 1));
                            setCopiedTemplate(t);
                            setTimeout(() => setCopiedTemplate(null), 1500);
                          }}
                          className={`h-5 w-5 rounded text-[10px] font-bold leading-none transition ${copiedTemplate === t ? 'bg-emerald-600 text-white' : 'bg-[#1d2c43] text-slate-300 hover:bg-slate-600'}`}
                          title={templateMsg(draft.title, t - 1)}
                        >
                          {copiedTemplate === t ? '✓' : t}
                        </button>
                      ))}
                    </div>
                    <div className="mt-0.5 text-sm text-slate-300 truncate">
                      {draft.price && <span>💰 {draft.price} </span>}
                      {draft.city && <span>📍 {draft.city} </span>}
                      {draft.seller_name && <span>👤 {draft.seller_name} </span>}
                      {draft.phone && <span>📞 {draft.phone} </span>}
                      {draft.source && <span>🔗 {draft.source_url ? <a href={draft.source_url} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:text-red-400 underline underline-offset-2">{draft.source}</a> : draft.source}</span>}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <div className="flex items-center gap-1">
                      <select value={ec.category} onChange={e => setEditCat(p => ({ ...p, [draft.id]: { ...p[draft.id], category: e.target.value, subcategory: '' } }))} className="rounded border border-[#2a3f55] bg-[#0b1727] px-2 py-1 text-sm text-white w-[130px]">
                        <option value="">Категорија</option>
                        {catOpts.map(c => <option key={c.slug} value={c.name}>{c.name}</option>)}
                      </select>
                      <select value={ec.subcategory} onChange={e => setEditCat(p => ({ ...p, [draft.id]: { ...p[draft.id], subcategory: e.target.value } }))} className="rounded border border-[#2a3f55] bg-[#0b1727] px-2 py-1 text-sm text-white w-[130px]">
                        <option value="">Подкатегорија</option>
                        {catOpts.find(c => c.name === ec.category)?.subcategories.map(sc => (
                          <option key={sc.slug} value={sc.slug}>{sc.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-1 flex-wrap justify-end">
                      <button onClick={() => publishDraft(draft.id, ec.category, ec.subcategory)} disabled={publishing === draft.id} className="rounded px-3 py-1 text-sm bg-emerald-700 hover:bg-emerald-600 text-white font-semibold disabled:opacity-50 whitespace-nowrap">
                        {publishing === draft.id ? '...' : '📦 Објави'}
                      </button>
                      <button onClick={() => startEdit(draft)} className="rounded px-2 py-1 text-xs bg-cyan-700 hover:bg-cyan-600 text-white font-semibold">Уреди</button>
                      <button onClick={() => deleteDraft(draft.id)} className="rounded px-2 py-1 text-xs bg-red-700 hover:bg-red-600 text-white font-semibold">Избриши</button>
                    </div>
                  </div>
                </div>
                <div className="overflow-hidden rounded-lg border border-[#2a3f55] bg-[#081223] p-3">
                  <p className="break-all whitespace-pre-wrap text-sm leading-6 text-slate-200">{draft.description}</p>
                </div>
                {draftImages(draft).length > 0 && (
                  <div className="mt-2 flex gap-2">
                    {draftImages(draft).slice(0, 5).map((url, i) => (
                      <img key={i} src={url} className="h-24 w-24 rounded object-cover border border-[#2a3f55]" />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
          );
        })}
      </div>
    </div>
  );
}

function templateMsg(title: string, idx: number): string {
  const t = [
    `Здраво, дозволете ни бесплатно да го објавиме вашиот оглас "${title}" и на КупиПродади. Ако сте заинтересирани, вратете ни порака. - Moже`,
    `Почитувани, го видовме вашиот оглас "${title}" и мислиме дека одлично одговара за нашата платформа Kupiprodadi.mk. Дозволете ни бесплатно да го објавиме. Ако сте заинтересирани, вратете ни порака. - Moже`,
    `Здраво, видовме сте објавиле оглас за "${title}", дозволете ни да го објавиме на огласникот - КупиПродади. Услугата е gratis и ви овозможува поголема видливост. Ако сакате, вратете ни порака. - Moже`,
  ];
  return t[idx];
}

function publishedTemplateMsg(idx: number): string {
  const t = [
    'благодариме за соработката!',
    'ви благодарам!',
    'благодарам многу!',
  ];
  return t[idx];
}

function CrmPublishedTab() {
  const [published, setPublished] = useState<(CrmDraft & { productStatus?: string; sold_at?: string | null })[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const [catOpts, setCatOpts] = useState<Array<{ name: string; slug: string; subcategories: Array<{ name: string; slug: string }> }>>([]);
  const [statusLoading, setStatusLoading] = useState<number | null>(null);
  const [copiedTemplate, setCopiedTemplate] = useState<number | null>(null);
  const [searchPublished, setSearchPublished] = useState('');

  useEffect(() => {
    fetch('/api/categories').then(r => r.json()).then(d => {
      if (Array.isArray(d?.categories)) setCatOpts(d.categories);
    }).catch(() => {});
  }, []);

  const loadPublished = async () => {
    try {
      const dr = await fetch('/api/crm/drafts?status=published').then(r => r.json());
      const list: any[] = (dr.drafts || []).map((d: any) => ({
        ...d,
        productStatus: d.product_status || (d.product_id ? 'active' : 'unknown'),
      }));
      setPublished(list);
    } catch {}
  };

  useEffect(() => { loadPublished(); }, []);

  const remove = async (draftId: number, productId?: number) => {
    if (!confirm('Избриши го огласот?')) return;
    try {
      if (productId) await fetch(`/api/crm/products/${productId}`, { method: 'DELETE' });
      await fetch(`/api/crm/drafts/${draftId}`, { method: 'DELETE' });
      loadPublished();
    } catch {}
  };

  const setStatus = async (productId: number, status: string) => {
    if (!productId || statusLoading) return;
    setStatusLoading(productId);
    try {
      const r = await fetch(`/api/crm/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!r.ok) alert('Грешка при промена на статус');
      else loadPublished();
    } catch { alert('Грешка при промена на статус'); }
    finally { setStatusLoading(null); }
  };

  const startEdit = (draft: any) => {
    const currentImages = draftImages(draft);
    setEditId(draft.id);
    setEditForm({
      title: draft.title,
      description: draft.description,
      price: draft.price,
      category: draft.category,
      subcategory: draft.subcategory || '',
      seller_name: draft.seller_name || '',
      phone: draft.phone || '',
      city: draft.city || '',
      images: JSON.stringify(currentImages),
    });
  };

  const removeEditableImage = (index: number) => {
    const imgs: string[] = JSON.parse(editForm.images || '[]');
    imgs.splice(index, 1);
    setEditForm(p => ({ ...p, images: JSON.stringify(imgs) }));
  };

  const saveEdit = async (draft: any) => {
    const pid = draft.product_id;
    const imgs: string[] = JSON.parse(editForm.images || '[]');
    try {
      if (pid) {
        await fetch(`/api/crm/products/${pid}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: editForm.title,
            description: editForm.description,
            price: parseFloat(editForm.price.replace(/[^0-9.,]/g, '')) || 0,
            category: editForm.category,
            subcategory: editForm.subcategory,
            city: editForm.city,
            contact_name: editForm.seller_name,
            contact_phone: editForm.phone,
            images: imgs,
          }),
        });
      }
      await fetch(`/api/crm/drafts/${draft.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
          price: editForm.price,
          category: editForm.category,
          subcategory: editForm.subcategory,
          seller_name: editForm.seller_name,
          phone: editForm.phone,
          city: editForm.city,
          images: imgs,
        }),
      });
      setEditId(null);
      loadPublished();
    } catch {}
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditForm({});
  };

  const draftImages = (draft: CrmDraft): string[] => {
    try { return JSON.parse(draft.images); } catch { return []; }
  };

  return (
    <div className="rounded-xl border border-[#2a3f55] bg-[#081223] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-emerald-400">✅ Објавени огласи</h2>
        <input value={searchPublished} onChange={e => setSearchPublished(e.target.value)} placeholder="🔍 Пребарај..." className="w-72 rounded border border-[#2a3f55] bg-[#0b1727] px-3 py-1.5 text-sm text-white placeholder:text-slate-500" />
      </div>
      {published.length === 0 && !searchPublished && <p className="text-sm text-slate-400">Нема објавени огласи.</p>}
      <div className="space-y-4">
        {published.filter(d => {
          if (!searchPublished) return true;
          const q = searchPublished.toLowerCase();
          return d.phone?.toLowerCase().includes(q) || d.seller_name?.toLowerCase().includes(q) || d.title?.toLowerCase().includes(q) || d.category?.toLowerCase().includes(q) || String(d.id).includes(q) || String(d.product_id || '').includes(q);
        }).map((draft) => {
          const pid = draft.product_id;
          const editing = editId === draft.id;
          const ef = editForm;
          return (
          <div key={draft.id} className="rounded-lg border-2 border-[#4d76bf] bg-[#0b1727] px-4 py-3">
            {editing ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input value={ef.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))} className="flex-1 rounded border border-[#2a3f55] bg-[#0b1727] px-2 py-1 text-sm text-white" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input value={ef.price} onChange={e => setEditForm(p => ({ ...p, price: e.target.value }))} className="rounded border border-[#2a3f55] bg-[#0b1727] px-2 py-1 text-sm text-white" placeholder="Цена" />
                  <input value={ef.city} onChange={e => setEditForm(p => ({ ...p, city: e.target.value }))} className="rounded border border-[#2a3f55] bg-[#0b1727] px-2 py-1 text-sm text-white" placeholder="Град" />
                  <input value={ef.seller_name} onChange={e => setEditForm(p => ({ ...p, seller_name: e.target.value }))} className="rounded border border-[#2a3f55] bg-[#0b1727] px-2 py-1 text-sm text-white" placeholder="Продавач" />
                  <input value={ef.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} className="rounded border border-[#2a3f55] bg-[#0b1727] px-2 py-1 text-sm text-white" placeholder="Телефон" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select value={ef.category} onChange={e => setEditForm(p => ({ ...p, category: e.target.value, subcategory: '' }))} className="rounded border border-[#2a3f55] bg-[#0b1727] px-2 py-1 text-sm text-white">
                    <option value="">Категорија</option>
                    {catOpts.map(c => <option key={c.slug} value={c.name}>{c.name}</option>)}
                  </select>
                  <select value={ef.subcategory} onChange={e => setEditForm(p => ({ ...p, subcategory: e.target.value }))} className="rounded border border-[#2a3f55] bg-[#0b1727] px-2 py-1 text-sm text-white">
                    <option value="">Подкатегорија</option>
                    {catOpts.find(c => c.name === ef.category)?.subcategories.map(sc => (
                      <option key={sc.slug} value={sc.slug}>{sc.name}</option>
                    ))}
                  </select>
                </div>
                <textarea value={ef.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full rounded border border-[#2a3f55] bg-[#0b1727] px-2 py-1 text-sm text-white" placeholder="Опис" />
                {(JSON.parse(ef.images || '[]') as string[]).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {(JSON.parse(ef.images || '[]') as string[]).map((url, i) => (
                      <div key={i} className="relative group">
                        <img src={url} className="h-20 w-20 rounded object-cover border border-[#2a3f55]" />
                        <button onClick={() => removeEditableImage(i)} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 text-white text-xs leading-none hover:bg-red-500">✕</button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex gap-2">
                    <span className="text-cyan-600 font-bold text-xs">КП-{String(draft.id)}</span>
                    {pid && <span className="text-yellow-600 font-bold text-xs">KP-{String(pid).padStart(6, '0')}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white font-semibold">Status</span>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${draft.sold_at ? 'bg-amber-700 text-amber-200' : draft.productStatus === 'active' ? 'bg-emerald-700 text-emerald-200' : 'bg-slate-600 text-slate-200'}`}>{draft.sold_at ? 'Продадено' : draft.productStatus === 'active' ? 'Активен' : 'Неактивен'}</span>
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(draft)} className="rounded px-3 py-1 text-sm bg-emerald-700 hover:bg-emerald-600 text-white font-semibold">Зачувај</button>
                      <button onClick={cancelEdit} className="rounded px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 text-white">Откажи</button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <a href={pid ? `/products/${pid}` : '#'} target="_blank" className="text-base font-bold text-white truncate hover:text-[#ef4444]">{draft.title}</a>
                      <span className="ml-auto text-xs text-white/50 font-semibold">Status</span>
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${draft.sold_at ? 'bg-amber-700 text-amber-200' : draft.productStatus === 'active' ? 'bg-emerald-700 text-emerald-200' : draft.productStatus === 'inactive' ? 'bg-slate-600 text-slate-200' : 'bg-slate-600 text-slate-200'}`}>{draft.sold_at ? 'Продадено' : draft.productStatus === 'active' ? 'Активен' : draft.productStatus === 'inactive' ? 'Неактивен' : 'Неактивен'}</span>
                      <span className="text-cyan-600 font-bold text-xs">КП-{String(draft.id)}</span>
                      {pid && <span className="text-yellow-600 font-bold text-xs">KP-{String(pid).padStart(6, '0')}</span>}
                      {draft.phone && <ViberButton phone={draft.phone} />}
                      {[1, 2, 3].map((t) => (
                        <button
                          key={t}
                          onClick={() => {
                            navigator.clipboard.writeText(publishedTemplateMsg(t - 1));
                            setCopiedTemplate(t);
                            setTimeout(() => setCopiedTemplate(null), 1500);
                          }}
                          className={`h-5 w-5 rounded text-[10px] font-bold leading-none transition ${copiedTemplate === t ? 'bg-emerald-600 text-white' : 'bg-[#1d2c43] text-slate-300 hover:bg-slate-600'}`}
                          title={publishedTemplateMsg(t - 1)}
                        >
                          {copiedTemplate === t ? '✓' : t}
                        </button>
                      ))}
                    </div>
                    <div className="mt-0.5 text-sm text-slate-300 truncate">
                      {draft.price && <span>💰 {draft.price} </span>}
                      {draft.city && <span>📍 {draft.city} </span>}
                      {draft.seller_name && <span>👤 {draft.seller_name} </span>}
                      {draft.phone && <span>📞 {draft.phone} </span>}
                      {draft.source && <span>🔗 {draft.source_url ? <a href={draft.source_url} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:text-red-400 underline underline-offset-2">{draft.source}</a> : draft.source}</span>}
                    </div>
                    {draft.category && (
                      <div className="mt-0.5 text-sm text-slate-400">
                        📁 {draft.category}{draft.subcategory ? ` / ${catOpts.find(c => c.name === draft.category)?.subcategories.find(s => s.slug === draft.subcategory)?.name || draft.subcategory}` : ''}
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <button onClick={() => startEdit(draft)} className="rounded px-2 py-1 text-xs bg-cyan-700 hover:bg-cyan-600 text-white font-semibold">Уреди</button>
                    <div className="flex gap-1 flex-wrap justify-end">
                      {pid ? (
                        <>
                          <button onClick={() => setStatus(pid, 'active')} disabled={statusLoading === pid} className={`rounded px-2 py-1 text-xs font-semibold ${draft.productStatus === 'active' && !draft.sold_at ? 'bg-emerald-500 ring-1 ring-emerald-300' : 'bg-emerald-700 hover:bg-emerald-600'} text-white disabled:opacity-50`}>Активен</button>
                          <button onClick={() => setStatus(pid, 'inactive')} disabled={statusLoading === pid} className={`rounded px-2 py-1 text-xs font-semibold ${draft.productStatus === 'inactive' ? 'bg-slate-500 ring-1 ring-slate-300' : 'bg-slate-700 hover:bg-slate-600'} text-white disabled:opacity-50`}>Неактивен</button>
                          <button onClick={() => setStatus(pid, 'sold')} disabled={statusLoading === pid} className={`rounded px-2 py-1 text-xs font-semibold ${draft.sold_at ? 'bg-amber-500 ring-1 ring-amber-300' : 'bg-amber-700 hover:bg-amber-600'} text-white disabled:opacity-50`}>Продадено</button>
                        </>
                      ) : (
                        <span className="text-xs text-slate-500">без продукт</span>
                      )}
                      <button onClick={() => remove(draft.id, pid ?? undefined)} className="ml-2 rounded px-2 py-1 text-xs bg-red-700 hover:bg-red-600 text-white font-semibold">Избриши</button>
                    </div>
                  </div>
                </div>
                {draft.description && (
                  <div className="overflow-hidden rounded-lg border border-[#2a3f55] bg-[#081223] p-3">
                    <p className="break-all whitespace-pre-wrap text-sm leading-6 text-slate-200">{draft.description}</p>
                  </div>
                )}
                {draftImages(draft).length > 0 && (
                  <div className="mt-2 flex gap-2">
                    {draftImages(draft).slice(0, 5).map((url, i) => (
                      <div key={i} className="relative">
                        <img src={url} className="h-24 w-24 rounded object-cover border border-[#2a3f55]" />
                        {draft.sold_at && (
                          <div className="absolute inset-0 flex items-center justify-center rounded bg-black/50">
                            <span className="-rotate-12 rounded border-2 border-red-500 bg-red-500/10 px-2 py-1 text-xs font-black text-red-500 leading-tight">ПРОДАДЕНО!</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
          );
        })}
      </div>
    </div>
  );
}

type ReportRow = {
  id: number;
  product_id: number;
  reporter_id: number | null;
  reason: string;
  status: string;
  created_at: string;
  product_title: string;
  product_image: string | null;
  product_price: number;
  product_currency: string;
  product_status: string;
  reporter_name: string | null;
  reporter_email: string | null;
  seller_name: string;
  seller_id: number;
  ip_address: string | null;
};

function ReportsTab() {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/reports');
      const d = await r.json();
      setReports(d.reports || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadReports(); }, []);

  const dismissReport = async (id: number) => {
    try {
      await fetch('/api/admin/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'dismissed' }),
      });
      loadReports();
    } catch {}
  };

  const reactivateReport = async (id: number) => {
    try {
      await fetch('/api/admin/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'new' }),
      });
      loadReports();
    } catch {}
  };

  const deleteReport = async (id: number) => {
    if (!confirm('Избриши ја пријавата?')) return;
    try {
      await fetch('/api/admin/reports', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      loadReports();
    } catch {}
  };

  const openProduct = (productId: number) => {
    window.open(`/products/${productId}`, '_blank');
  };

  if (loading) {
    return <div className="rounded-xl border border-[#2a3f55] bg-[#081223] p-5"><p className="text-slate-400">Се вчитува...</p></div>;
  }

  return (
    <div className="rounded-xl border border-[#2a3f55] bg-[#081223] p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-amber-400">⚠️ Пријави злоупотреба</h2>
        <span className="text-sm text-slate-400">{reports.length} вкупно</span>
      </div>

      {reports.length === 0 && <p className="text-sm text-slate-400">Нема пријави.</p>}

      <div className="space-y-3">
        {reports.map((report) => (
          <div key={report.id} className={`rounded-lg border-2 px-4 py-3 ${report.status === 'new' ? 'border-red-800/60 bg-red-900/10' : 'border-[#2a3f55] bg-[#0b1727] opacity-60'}`}>
            <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <a href={`/products/${report.product_id}`} target="_blank" rel="noopener noreferrer" className="text-base font-bold text-white truncate hover:underline">{report.product_title}</a>
                  {report.status === 'new' && (
                    <span className="rounded bg-red-600/20 px-1.5 py-0.5 text-xs font-semibold text-red-300">Нова</span>
                  )}
                  {report.status === 'dismissed' && (
                    <span className="rounded bg-slate-600/20 px-1.5 py-0.5 text-xs font-semibold text-slate-400">Отфрлена</span>
                  )}
                </div>
                <div className="mt-0.5 text-sm text-slate-300">
                  <span>👤 Продавач: <span className="font-semibold text-blue-300">IDP:{report.seller_id}</span> {report.seller_name}</span>
                  {report.reporter_name && <span> · Пријавил: <span className="font-semibold text-sky-300">{report.reporter_name}</span></span>}
                  {report.reporter_email && <span> · {report.reporter_email}</span>}
                  <span> · {new Date(report.created_at).toLocaleDateString('mk-MK')}</span>
                  {report.ip_address && <span> · IP: {report.ip_address}</span>}
                  {report.reason && <span> · <span className="text-slate-400">{report.reason}</span></span>}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  onClick={() => openProduct(report.product_id)}
                  className="rounded px-2.5 py-1 text-xs bg-cyan-700 hover:bg-cyan-600 text-white font-semibold"
                >
                  📄 Оглас
                </button>
                {report.status === 'dismissed' && (
                  <button
                    onClick={() => reactivateReport(report.id)}
                    className="rounded px-2.5 py-1 text-xs bg-amber-700 hover:bg-amber-600 text-white font-semibold"
                  >
                    Врати
                  </button>
                )}
                {report.status === 'new' && (
                  <button
                    onClick={() => dismissReport(report.id)}
                    className="rounded px-2.5 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-white font-semibold"
                  >
                    Отфрли
                  </button>
                )}
                <button
                  onClick={() => deleteReport(report.id)}
                  className="rounded px-2.5 py-1 text-xs bg-red-700 hover:bg-red-600 text-white font-semibold"
                >
                  Избриши
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminPageContent() {
  const { dark } = useTheme();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [me, setMe] = useState<AdminMe | null>(null);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]['id']>(
    (searchParams.get('tab') as any) || 'products'
  );
  const [statusFilter, setStatusFilter] = useState('pending');
  const [productSort, setProductSort] = useState<'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'title_asc'>('newest');
  const [productSource, setProductSource] = useState<'all' | 'regular' | 'crm'>('all');
  const [productSearch, setProductSearch] = useState('');
  const [adminPerPage, setAdminPerPage] = useState(30);
  const [adminPage, setAdminPage] = useState(1);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [editingProductForm, setEditingProductForm] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [banners, setBanners] = useState<BannerRow[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [userSort, setUserSort] = useState<'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'ads_high' | 'ads_low'>('newest');
  const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [userCounts, setUserCounts] = useState({ total: 0, active: 0, inactive: 0 });
  const [composeUser, setComposeUser] = useState<AdminComposeTarget | null>(null);
  const [auditUser, setAuditUser] = useState<AdminComposeTarget | null>(null);
  const [auditMessages, setAuditMessages] = useState<AdminUserMessage[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [adminMessageText, setAdminMessageText] = useState('');
  const [categorySort, setCategorySort] = useState<'name_asc' | 'name_desc' | 'newest'>('newest');
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [login, setLogin] = useState({ email: '', password: '' });
  const [setup, setSetup] = useState({ name: '', email: '', password: '', phone: '' });
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', icon: 'layout-grid', isActive: true });
  const [subcategoryForm, setSubcategoryForm] = useState({ parentId: '', name: '', slug: '', isActive: true });
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingSubcategoryId, setEditingSubcategoryId] = useState<number | null>(null);
  const [categorySlugTouched, setCategorySlugTouched] = useState(false);
  const [subcategorySlugTouched, setSubcategorySlugTouched] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<number | null>(null);
  const [bannerForm, setBannerForm] = useState({
    image_url: '',
    link_url: '',
    sort_order: '',
    is_active: true,
  });
  const [bannerDimensions, setBannerDimensions] = useState<Record<string, { width: number; height: number } | null>>({});
  const [homepageSections, setHomepageSections] = useState<HomepageSectionsState>({
    headerCategorySlugs: [],
    trustItems: [
      { icon: 'shield-check', color: 'text-blue-400', title: 'Безбедно купување', subtitle: 'Проверени продавачи' },
      { icon: 'badge-check', color: 'text-emerald-400', title: '100% Бесплатно', subtitle: 'Објави оглас без надомест' },
      { icon: 'zap', color: 'text-amber-400', title: 'Брзо и лесно', subtitle: 'Само неколку клика' },
      { icon: 'users', color: 'text-pink-400', title: '10,000+ активни', subtitle: 'Купувачи секој ден' },
    ],
    homeCategorySlugs: [],
  });

  const refreshMe = async () => {
    const response = await fetch('/api/admin/me', { cache: 'no-store' });
    const data = await response.json();
    setMe(data);
    return data;
  };

  const refreshProducts = async (nextStatus = statusFilter, nextSort = productSort, nextSource = productSource) => {
    const response = await fetch(`/api/admin/products?status=${encodeURIComponent(nextStatus)}&sort=${encodeURIComponent(nextSort)}&source=${encodeURIComponent(nextSource)}`, { cache: 'no-store' });
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

  const refreshHomepageSections = async () => {
    const response = await fetch('/api/admin/homepage-sections', { cache: 'no-store' });
    const data = await response.json();
    setHomepageSections({
      headerCategorySlugs: Array.isArray(data?.headerCategorySlugs) ? data.headerCategorySlugs : [],
      trustItems: Array.isArray(data?.trustItems) ? data.trustItems : homepageSections.trustItems,
      homeCategorySlugs: Array.isArray(data?.homeCategorySlugs) ? data.homeCategorySlugs : [],
    });
  };

  const refreshUsers = async (
    nextSearch = userSearch,
    nextSort = userSort,
    nextStatus = userStatusFilter
  ) => {
    const params = new URLSearchParams({
      sort: nextSort,
      status: nextStatus,
    });
    if (nextSearch.trim()) params.set('search', nextSearch.trim());
    const response = await fetch(`/api/admin/users?${params.toString()}`, { cache: 'no-store' });
    const data = await response.json();
    setUsers(Array.isArray(data?.users) ? data.users : []);
    setUserCounts({
      total: Number(data?.counts?.total || 0),
      active: Number(data?.counts?.active || 0),
      inactive: Number(data?.counts?.inactive || 0),
    });
  };

  useEffect(() => {
    refreshMe().catch(() => setMe({ authenticated: false, setupRequired: false }));
  }, []);

  useEffect(() => {
    if (!me?.authenticated) return;
    refreshProducts().catch(() => {});
    refreshUsers().catch(() => {});
    refreshCategories().catch(() => {});
    refreshBanners().catch(() => {});
    refreshHomepageSections().catch(() => {});
  }, [me?.authenticated]);

  useEffect(() => {
    if (!me?.authenticated || activeTab !== 'products') return;
    refreshProducts(statusFilter, productSort, productSource).catch(() => {});
  }, [statusFilter, productSort, productSource, activeTab, me?.authenticated]);

  useEffect(() => {
    setAdminPage(1);
  }, [statusFilter, productSort, productSource, productSearch, adminPerPage]);

  useEffect(() => {
    if (!me?.authenticated || activeTab !== 'users') return;
    refreshUsers(userSearch, userSort, userStatusFilter).catch(() => {});
  }, [userSearch, userSort, userStatusFilter, activeTab, me?.authenticated]);

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

  const deleteProduct = async (id: number) => {
    if (!confirm('Дали си сигурен дека сакаш трајно да го избришеш овој оглас?')) return;
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Не успеа бришење');
      await refreshProducts(statusFilter);
      setMessage('Огласот е трајно избришан.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Грешка при бришење.');
    } finally {
      setBusy(false);
    }
  };

  const startEditProduct = (product: ProductRow) => {
    setEditingProductId(product.id);
    setEditingProductForm({
      title: product.title,
      description: product.description,
      price: String(product.price),
      city: product.city || '',
      category: product.category,
      subcategory: product.subcategory || '',
      condition: product.condition || '',
      delivery: product.delivery || '',
      contact_name: product.contact_name || '',
      contact_phone: product.contact_phone || '',
      contact_email: product.contact_email || '',
      negotiable: String(Number(product.negotiable)),
      trade_possible: String(Number(product.trade_possible)),
      images: JSON.stringify(product.images || []),
    });
  };

  const cancelEditProduct = () => {
    setEditingProductId(null);
    setEditingProductForm({});
  };

  const saveProductEdit = async (id: number) => {
    try {
      const r = await fetch(`/api/admin/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingProductForm.title,
          description: editingProductForm.description,
          price: Number(editingProductForm.price),
          city: editingProductForm.city,
          category: editingProductForm.category,
          subcategory: editingProductForm.subcategory,
          condition: editingProductForm.condition,
          delivery: editingProductForm.delivery,
          contact_name: editingProductForm.contact_name,
          contact_phone: editingProductForm.contact_phone,
          contact_email: editingProductForm.contact_email,
          negotiable: editingProductForm.negotiable === '1',
          trade_possible: editingProductForm.trade_possible === '1',
        }),
      });
      if (r.ok) {
        setEditingProductId(null);
        setEditingProductForm({});
        await refreshProducts();
      } else {
        const data = await r.json();
        alert(data.error || 'Грешка при зачувување');
      }
    } catch (err: any) {
      alert(err.message);
    }
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

  const toggleUserActive = async (user: UserRow) => {
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !Boolean(user.is_active) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Не успеа менување статус на корисник');
      await refreshUsers(userSearch, userSort, userStatusFilter);
      setMessage(user.is_active ? 'Корисникот е деактивиран.' : 'Корисникот е повторно активиран.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Грешка при менување статус на корисник.');
    } finally {
      setBusy(false);
    }
  };

  const sendAdminMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    const targetIds = composeUser ? [composeUser.id] : selectedUserIds;
    if (!targetIds.length) return;
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch('/api/admin/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiver_ids: targetIds,
          content: adminMessageText,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Не успеа испраќање порака');
      setAdminMessageText('');
      setComposeUser(null);
      setSelectedUserIds([]);
      setMessage(targetIds.length === 1 ? 'Пораката е испратена до корисникот.' : `Пораката е испратена до ${targetIds.length} корисници.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Грешка при испраќање порака.');
    } finally {
      setBusy(false);
    }
  };

  const openUserMessages = async (user: AdminComposeTarget) => {
    setComposeUser(null);
    setAuditUser(user);
    setAuditMessages([]);
    setAuditLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}/messages`, { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Не успеав да ги вчитам пораките.');
      setAuditMessages(Array.isArray(data?.messages) ? data.messages : []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Не успеав да ги вчитам пораките.');
      setAuditUser(null);
    } finally {
      setAuditLoading(false);
    }
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUserIds((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
    setComposeUser(null);
  };

  const allVisibleUserIds = users.filter((user) => user.role !== 'admin').map((user) => user.id);
  const allVisibleSelected = allVisibleUserIds.length > 0 && allVisibleUserIds.every((id) => selectedUserIds.includes(id));

  const toggleSelectAllVisibleUsers = () => {
    setComposeUser(null);
    setSelectedUserIds((prev) => {
      if (allVisibleSelected) {
        return prev.filter((id) => !allVisibleUserIds.includes(id));
      }
      return Array.from(new Set([...prev, ...allVisibleUserIds]));
    });
  };

  const submitCategory = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(editingCategoryId ? `/api/categories/${editingCategoryId}` : '/api/categories', {
        method: editingCategoryId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: categoryForm.name,
          slug: categoryForm.slug,
          icon: categoryForm.icon,
          isActive: categoryForm.isActive,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Не успеа зачувување категорија');
      setCategoryForm({ name: '', slug: '', icon: 'layout-grid', isActive: true });
      setCategorySlugTouched(false);
      setEditingCategoryId(null);
      await refreshCategories();
      setMessage(editingCategoryId ? 'Категоријата е ажурирана.' : 'Категоријата е додадена.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Грешка при зачувување категорија.');
    } finally {
      setBusy(false);
    }
  };

  const submitSubcategory = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(editingSubcategoryId ? `/api/categories/${editingSubcategoryId}` : '/api/categories', {
        method: editingSubcategoryId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parentId: Number(subcategoryForm.parentId),
          name: subcategoryForm.name,
          slug: subcategoryForm.slug,
          isActive: subcategoryForm.isActive,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Не успеа зачувување подкатегорија');
      setSubcategoryForm({ parentId: '', name: '', slug: '', isActive: true });
      setSubcategorySlugTouched(false);
      setEditingSubcategoryId(null);
      await refreshCategories();
      setMessage(editingSubcategoryId ? 'Подкатегоријата е ажурирана.' : 'Подкатегоријата е додадена.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Грешка при зачувување подкатегорија.');
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

  const startEditCategory = (category: CategoryNode) => {
    setEditingCategoryId(category.id);
    setEditingSubcategoryId(null);
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      icon: category.icon || 'layout-grid',
      isActive: true,
    });
    setCategorySlugTouched(false);
    setSubcategoryForm({ parentId: '', name: '', slug: '', isActive: true });
    setSubcategorySlugTouched(false);
    setActiveTab('categories');
    setMessage(null);
  };

  const startEditSubcategory = (parent: CategoryNode, subcategory: CategoryNode['subcategories'][number]) => {
    setEditingSubcategoryId(subcategory.id);
    setEditingCategoryId(null);
    setSubcategoryForm({
      parentId: String(parent.id),
      name: subcategory.name,
      slug: subcategory.slug,
      isActive: true,
    });
    setSubcategorySlugTouched(false);
    setCategoryForm({ name: '', slug: '', icon: 'layout-grid', isActive: true });
    setCategorySlugTouched(false);
    setActiveTab('categories');
    setMessage(null);
  };

  const cancelCategoryEdit = () => {
    setEditingCategoryId(null);
    setCategoryForm({ name: '', slug: '', icon: 'layout-grid', isActive: true });
    setCategorySlugTouched(false);
  };

  const cancelSubcategoryEdit = () => {
    setEditingSubcategoryId(null);
    setSubcategoryForm({ parentId: '', name: '', slug: '', isActive: true });
    setSubcategorySlugTouched(false);
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

  const updateHomepageCategorySlug = (
    section: 'headerCategorySlugs' | 'homeCategorySlugs',
    index: number,
    value: string,
  ) => {
    setHomepageSections((prev) => {
      const next = [...prev[section]];
      next[index] = value;
      return { ...prev, [section]: next };
    });
  };

  const updateTrustItem = (index: number, field: 'title' | 'subtitle', value: string) => {
    setHomepageSections((prev) => ({
      ...prev,
      trustItems: prev.trustItems.map((item, itemIndex) => (
        itemIndex === index ? { ...item, [field]: value } : item
      )),
    }));
  };

  const submitHomepageSections = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch('/api/admin/homepage-sections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(homepageSections),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Не успеа зачувување на почетните банери');
      await refreshHomepageSections();
      setMessage('Почетните банери се ажурирани.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Грешка при зачувување на почетните банери.');
    } finally {
      setBusy(false);
    }
  };

  const handleCategoryNameChange = (value: string) => {
    setCategoryForm((prev) => ({
      ...prev,
      name: value,
      slug: categorySlugTouched ? prev.slug : slugify(value),
    }));
  };

  const handleSubcategoryNameChange = (value: string) => {
    setSubcategoryForm((prev) => ({
      ...prev,
      name: value,
      slug: subcategorySlugTouched ? prev.slug : slugify(value),
    }));
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#050b17] py-2.5 text-white md:py-3">
        <Container>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-[2.1rem] font-bold leading-none">Admin Panel</h1>
              <p className="mt-0.5 text-sm leading-snug text-slate-400">Од тука ќе одобруваш огласи, ќе управуваш со категории и ќе поставуваш промотивни позиции за поголема видливост.</p>
            </div>
            {me?.authenticated && (
              <div className="flex items-center gap-2">
                <Button onClick={logout} className="admin-dark-button bg-slate-700 hover:bg-slate-600 text-white">
                  Одјава
                </Button>
              </div>
            )}
          </div>

          {message && (
            <div className={`mb-3 rounded-lg border px-4 py-2.5 text-sm ${
              dark
                ? 'border-blue-500/30 bg-blue-500/10 text-blue-100'
                : 'border-blue-400/50 bg-blue-50 text-blue-900'
            }`}>
              {message}
            </div>
          )}

          {!me?.authenticated && me?.setupRequired && (
            <form onSubmit={submitSetup} className="max-w-xl space-y-4 rounded-xl border border-[#2a3f55] bg-[#081223] p-6">
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
            <form onSubmit={submitLogin} className="max-w-xl space-y-4 rounded-xl border border-[#2a3f55] bg-[#081223] p-6">
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
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); router.push(`/admin?tab=${tab.id}`); }}
                    className={`admin-dark-button rounded-lg px-4 py-1.5 text-sm font-semibold ${activeTab === tab.id ? 'bg-red-600 text-white' : 'bg-[#0c1628] text-slate-300'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === 'products' && (
                <section className="rounded-xl border border-[#2a3f55] bg-[#081223] p-5">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <h2 className="text-xl font-bold">Одобрување огласи</h2>
                    <div className="flex gap-2">
                      <input
                        value={productSearch}
                        onChange={e => setProductSearch(e.target.value)}
                        placeholder="🔍 Пребарај..."
                        className="w-56 rounded border border-[#2a3f55] bg-[#0b1727] px-3 py-1.5 text-sm text-white placeholder:text-slate-500"
                      />
                      <select
                        value={productSort}
                        onChange={(e) => setProductSort(e.target.value as 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'title_asc')}
                        className="rounded-lg border border-[#2a3f55] bg-[#0b1727] px-3 py-2 text-sm text-white"
                      >
                        <option value="newest">Најнови</option>
                        <option value="oldest">Најстари</option>
                        <option value="price_asc">Цена растечка</option>
                        <option value="price_desc">Цена опаѓачка</option>
                        <option value="title_asc">По име (А-Ш)</option>
                      </select>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded-lg border border-[#2a3f55] bg-[#0b1727] px-3 py-2 text-sm text-white"
                      >
                        <option value="">Сите</option>
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="rejected">Rejected</option>
                      </select>
                      <select
                        value={productSource}
                        onChange={(e) => setProductSource(e.target.value as typeof productSource)}
                        className="rounded-lg border border-[#2a3f55] bg-[#0b1727] px-3 py-2 text-sm text-white"
                      >
                        <option value="all">Сите извори</option>
                        <option value="regular">Обични</option>
                        <option value="crm">CRM</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {(() => {
                      const filtered = products.filter(p => {
                        if (!productSearch) return true;
                        const q = productSearch.toLowerCase();
                        const kpId = `KP-${String(p.id).padStart(6, '0')}`;
                        return p.title.toLowerCase().includes(q)
                          || kpId.toLowerCase().includes(q)
                          || String(p.id).includes(q)
                          || p.seller_name?.toLowerCase().includes(q)
                          || p.seller_email?.toLowerCase().includes(q)
                          || p.contact_name?.toLowerCase().includes(q)
                          || p.contact_phone?.toLowerCase().includes(q)
                          || p.contact_email?.toLowerCase().includes(q);
                      });
                      const totalPages = Math.ceil(filtered.length / adminPerPage);
                      const pageItems = filtered.slice((adminPage - 1) * adminPerPage, adminPage * adminPerPage);
                      return (
                        <>
                          {pageItems.map((product) => (
                      <div key={product.id} className="rounded-lg border-2 border-[#2d4a6a] bg-[#0b1727] p-4">
                        {editingProductId === product.id ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                              <input value={editingProductForm.title} onChange={e => setEditingProductForm(p => ({ ...p, title: e.target.value }))} className="col-span-2 rounded border border-[#2a3f55] bg-[#0b1727] px-2 py-1 text-sm text-white" placeholder="Наслов" />
                              <input value={editingProductForm.price} onChange={e => setEditingProductForm(p => ({ ...p, price: e.target.value }))} className="rounded border border-[#2a3f55] bg-[#0b1727] px-2 py-1 text-sm text-white" placeholder="Цена" />
                              <input value={editingProductForm.city} onChange={e => setEditingProductForm(p => ({ ...p, city: e.target.value }))} className="rounded border border-[#2a3f55] bg-[#0b1727] px-2 py-1 text-sm text-white" placeholder="Град" />
                              <select value={editingProductForm.category} onChange={e => setEditingProductForm(p => ({ ...p, category: e.target.value, subcategory: '' }))} className="rounded border border-[#2a3f55] bg-[#0b1727] px-2 py-1 text-sm text-white">
                                <option value="">Категорија</option>
                                {categories.map(c => <option key={c.slug} value={c.name}>{c.name}</option>)}
                              </select>
                              <select value={editingProductForm.subcategory} onChange={e => setEditingProductForm(p => ({ ...p, subcategory: e.target.value }))} className="rounded border border-[#2a3f55] bg-[#0b1727] px-2 py-1 text-sm text-white">
                                <option value="">Подкатегорија</option>
                                {categories.find(c => c.name === editingProductForm.category)?.subcategories.map(sc => (
                                  <option key={sc.slug} value={sc.slug}>{sc.name}</option>
                                ))}
                              </select>
                              <select value={editingProductForm.condition} onChange={e => setEditingProductForm(p => ({ ...p, condition: e.target.value }))} className="rounded border border-[#2a3f55] bg-[#0b1727] px-2 py-1 text-sm text-white">
                                <option value="Многу добро">Многу добро</option>
                                {['Ново', 'Нова', 'Како ново', 'Добро', 'Половна', 'Користено', 'За делови'].map(c => (
                                  <option key={c} value={c}>{c}</option>
                                ))}
                              </select>
                              <select value={editingProductForm.delivery} onChange={e => setEditingProductForm(p => ({ ...p, delivery: e.target.value }))} className="rounded border border-[#2a3f55] bg-[#0b1727] px-2 py-1 text-sm text-white">
                                <option value="По договор">По договор</option>
                                {['Лично преземање', 'Карго', 'Достава во град'].map(d => (
                                  <option key={d} value={d}>{d}</option>
                                ))}
                              </select>
                              <input value={editingProductForm.contact_name} onChange={e => setEditingProductForm(p => ({ ...p, contact_name: e.target.value }))} className="rounded border border-[#2a3f55] bg-[#0b1727] px-2 py-1 text-sm text-white" placeholder="Контакт име" />
                              <input value={editingProductForm.contact_phone} onChange={e => setEditingProductForm(p => ({ ...p, contact_phone: e.target.value }))} className="rounded border border-[#2a3f55] bg-[#0b1727] px-2 py-1 text-sm text-white" placeholder="Контакт телефон" />
                              <input value={editingProductForm.contact_email} onChange={e => setEditingProductForm(p => ({ ...p, contact_email: e.target.value }))} className="col-span-2 rounded border border-[#2a3f55] bg-[#0b1727] px-2 py-1 text-sm text-white" placeholder="Контакт емаил" />
                            </div>
                            <textarea value={editingProductForm.description} onChange={e => setEditingProductForm(p => ({ ...p, description: e.target.value }))} rows={4} className="w-full rounded border border-[#2a3f55] bg-[#0b1727] px-2 py-1 text-sm text-white" placeholder="Опис" />
                            <div className="flex flex-wrap items-center gap-2">
                              <label className="flex items-center gap-1.5 text-sm text-slate-300">
                                <input type="checkbox" checked={editingProductForm.negotiable === '1'} onChange={e => setEditingProductForm(p => ({ ...p, negotiable: e.target.checked ? '1' : '0' }))} />
                                Цена по договор
                              </label>
                              <label className="flex items-center gap-1.5 text-sm text-slate-300">
                                <input type="checkbox" checked={editingProductForm.trade_possible === '1'} onChange={e => setEditingProductForm(p => ({ ...p, trade_possible: e.target.checked ? '1' : '0' }))} />
                                Можна замена
                              </label>
                            </div>
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => saveProductEdit(product.id)} className="rounded px-3 py-1 text-sm bg-emerald-700 hover:bg-emerald-600 text-white font-semibold">Зачувај</button>
                              <button onClick={cancelEditProduct} className="rounded px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 text-white">Откажи</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                              <div className="min-w-0 flex-1">
                                <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm text-slate-200">
                                  <a href={`/products/${product.id}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-white hover:text-red-400 transition">{product.title}</a>
                                  {(product as any).source === 'crm' && <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-300">CRM</span>}
                                  <span className="text-slate-500">/</span>
                                  <span>{product.seller_name}</span>
                                  <span className="text-slate-500">/</span>
                                  <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-xs font-mono font-semibold text-blue-300">IDP:{product.seller_id}</span>
                                  <span className="text-slate-500">/</span>
                                  <span className="rounded bg-yellow-500/20 px-1.5 py-0.5 text-xs font-mono font-semibold text-yellow-400">KP-{String(product.id).padStart(6, '0')}</span>
                                  <span className="text-slate-500">/</span>
                                  <span className="text-slate-400">{product.contact_phone || 'Нема телефон'}</span>
                                </p>
                                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-slate-400">
                                  <span className="font-semibold text-slate-200">{product.price} {product.currency}</span>
                                  <span className="text-slate-600">/</span>
                                  <span>{product.city || product.location || 'Нема град'}</span>
                                  <span className="text-slate-600">/</span>
                                  <span>{product.category}{product.subcategory ? ` / ${product.subcategory}` : ''}</span>
                                  <span className="text-slate-600">/</span>
                                  <span>{product.condition || 'Нема состојба'}</span>
                                  <span className="text-slate-600">/</span>
                                  <span>{product.delivery || 'Нема достава'}</span>
                                </p>
                                <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                                  {Boolean(product.negotiable) && <span className="rounded bg-orange-500/20 px-1.5 py-0.5 text-[11px] font-semibold text-orange-300">Цена по договор</span>}
                                  {!product.negotiable && <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-[11px] font-semibold text-red-300">Цената е фиксна</span>}
                                  {Boolean(product.trade_possible) && <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-300">Можна замена</span>}
                                  {Boolean(product.has_viber) && <span className="text-purple-400 font-semibold">Viber</span>}
                                  {Boolean(product.has_whatsapp) && <span className="text-emerald-400 font-semibold">WA</span>}
                                  {Boolean(product.has_telegram) && <span className="text-sky-400 font-semibold">TG</span>}
                                  <span className="text-slate-500">{product.contact_email || product.seller_email}</span>
                                </p>
                              </div>
                              <div className="flex shrink-0 gap-1.5 flex-wrap items-start">
                                <Button onClick={() => startEditProduct(product)} className="admin-dark-button bg-cyan-700 hover:bg-cyan-600 text-white !px-2 !py-1 text-xs">Уреди</Button>
                                <Button onClick={() => changeProductStatus(product.id, 'active')} className="admin-dark-button bg-green-600 hover:bg-green-500 text-white !px-2 !py-1 text-xs"><Check size={14} className="inline-block" /> Одобри</Button>
                                <Button onClick={() => changeProductStatus(product.id, 'rejected')} className="admin-dark-button bg-orange-700 hover:bg-orange-600 text-white !px-2 !py-1 text-xs"><X size={14} className="inline-block" /> Одбиј</Button>
                                <Button onClick={() => deleteProduct(product.id)} className="admin-dark-button bg-red-900 hover:bg-red-800 text-white ring-1 ring-red-500 !px-2 !py-1 text-xs"><Trash2 size={14} className="inline-block" /> Избриши</Button>
                                {product.status !== 'pending' && (
                                  <Button onClick={() => changeProductStatus(product.id, 'pending')} className="admin-dark-button bg-slate-700 hover:bg-slate-600 text-white !px-2 !py-1 text-xs">Врати pending</Button>
                                )}
                              </div>
                            </div>

                            {product.description && (
                              <div className="overflow-hidden rounded-lg border border-[#2a3f55] bg-[#081223] p-4">
                                <p className="break-all whitespace-pre-wrap text-sm leading-6 text-slate-200">{product.description}</p>
                              </div>
                            )}

                            {product.images?.length > 0 && (
                              <div className="flex flex-wrap gap-3">
                                {product.images.map((image, index) => (
                                  <a key={`${product.id}-${index}`} href={image} target="_blank" rel="noopener noreferrer" className="block">
                                    <img
                                      src={image}
                                      alt={`${product.title} ${index + 1}`}
                                      className="h-28 w-36 rounded-lg border border-[#2a3f55] bg-[#081223] object-cover"
                                    />
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                );
              })()}
                    {products.length === 0 && <p className="text-sm text-slate-400">Нема огласи во овој статус.</p>}
                    {(() => {
                      const filtered = products.filter(p => {
                        if (!productSearch) return true;
                        const q = productSearch.toLowerCase();
                        const kpId = `KP-${String(p.id).padStart(6, '0')}`;
                        return p.title.toLowerCase().includes(q)
                          || kpId.toLowerCase().includes(q)
                          || String(p.id).includes(q)
                          || p.seller_name?.toLowerCase().includes(q)
                          || p.seller_email?.toLowerCase().includes(q)
                          || p.contact_name?.toLowerCase().includes(q)
                          || p.contact_phone?.toLowerCase().includes(q)
                          || p.contact_email?.toLowerCase().includes(q);
                      });
                      const totalPages = Math.ceil(filtered.length / adminPerPage);
                      return (
                        <div className="mt-4">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                              <span className="whitespace-nowrap">Прикажи:</span>
                              {[30, 50, 70, 100].map(n => (
                                <button
                                  key={n}
                                  onClick={() => setAdminPerPage(n)}
                                  className={`rounded border px-1.5 py-0.5 transition ${
                                    adminPerPage === n
                                      ? 'border-red-500/50 bg-red-600/20 text-red-300 font-semibold'
                                      : 'border-[#2a3f55] bg-[#0b1727] text-slate-300 hover:bg-[#1d2c43]'
                                  }`}
                                >
                                  {n}
                                </button>
                              ))}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setAdminPage(p => Math.max(1, p - 1))}
                                disabled={adminPage === 1}
                                className="rounded border border-[#2a3f55] bg-[#0b1727] px-2.5 py-1 text-xs text-slate-300 hover:bg-[#1d2c43] disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
                              >
                                « Претходна
                              </button>
                              {(() => {
                                const PAGE_BOXES = 5;
                                let start = Math.max(1, adminPage - 2);
                                if (start + PAGE_BOXES - 1 > totalPages) start = Math.max(1, totalPages - PAGE_BOXES + 1);
                                const boxes: number[] = [];
                                for (let i = start; i < start + PAGE_BOXES && i <= totalPages; i++) boxes.push(i);
                                return boxes.map(p => (
                                  <button
                                    key={p}
                                    onClick={() => setAdminPage(p)}
                                    className={`min-w-[32px] rounded border px-2 py-1 text-xs transition ${
                                      adminPage === p
                                        ? 'border-red-500/50 bg-red-600/20 text-red-300 font-semibold'
                                        : 'border-[#2a3f55] bg-[#0b1727] text-slate-300 hover:bg-[#1d2c43]'
                                    }`}
                                  >
                                    {p}
                                  </button>
                                ));
                              })()}
                              <button
                                onClick={() => setAdminPage(p => Math.min(totalPages, p + 1))}
                                disabled={adminPage === totalPages}
                                className="rounded border border-[#2a3f55] bg-[#0b1727] px-2.5 py-1 text-xs text-slate-300 hover:bg-[#1d2c43] disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
                              >
                                Следна страна »
                              </button>
                            </div>
                            <div className="text-xs text-slate-500">{filtered.length} вкупно</div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </section>
              )}

              {activeTab === 'users' && (
                <section className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-[#2a3f55] bg-[#081223] p-5">
                      <p className="text-sm font-medium text-slate-400">Вкупно корисници</p>
                      <p className="mt-3 text-3xl font-bold text-white">{userCounts.total}</p>
                    </div>
                    <div className="rounded-xl border border-[#2a3f55] bg-[#081223] p-5">
                      <p className="text-sm font-medium text-slate-400">Активни профили</p>
                      <p className="mt-3 text-3xl font-bold text-emerald-400">{userCounts.active}</p>
                    </div>
                    <div className="rounded-xl border border-[#2a3f55] bg-[#081223] p-5">
                      <p className="text-sm font-medium text-slate-400">Деактивирани профили</p>
                      <p className="mt-3 text-3xl font-bold text-rose-400">{userCounts.inactive}</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#2a3f55] bg-[#081223] p-5">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
                      <div>
                        <h2 className="text-xl font-bold">Корисници</h2>
                        <p className="mt-2 text-sm text-slate-400">
                          Пребарувај, сортирај и деактивирај профили ако забележиш злоупотреба или scam однесување.
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[760px]">
                        <div className="sm:col-span-1">
                          <label className="mb-2 block text-sm font-semibold text-slate-200">Пребарување</label>
                          <Input
                            placeholder="Име, email, телефон или ID"
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                            className={`admin-dark-input h-10 !py-2 ${
                              dark
                                ? '!bg-[#0b1727] !border-[#2a3f55] !text-white placeholder:!text-slate-500'
                                : '!bg-white !border-[#4b5d78] !text-slate-900 placeholder:!text-slate-500'
                            }`}
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-200">Сортирање</label>
                          <select
                            value={userSort}
                            onChange={(e) => setUserSort(e.target.value as 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'ads_high' | 'ads_low')}
                            className="h-11 w-full rounded-lg border border-[#2a3f55] bg-[#0b1727] px-3 text-sm text-white"
                          >
                            <option value="newest">Најново регистрирани</option>
                            <option value="oldest">Најстари профили</option>
                            <option value="rating_high">Највисок рејтинг</option>
                            <option value="rating_low">Најнизок рејтинг</option>
                            <option value="ads_high">Најмногу огласи</option>
                            <option value="ads_low">Најмалку огласи</option>
                          </select>
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-slate-200">Статус</label>
                          <select
                            value={userStatusFilter}
                            onChange={(e) => setUserStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                            className="h-11 w-full rounded-lg border border-[#2a3f55] bg-[#0b1727] px-3 text-sm text-white"
                          >
                            <option value="all">Сите корисници</option>
                            <option value="active">Само активни</option>
                            <option value="inactive">Само деактивирани</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {(composeUser || selectedUserIds.length > 0) && (
                      <form onSubmit={sendAdminMessage} className="mt-5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-white">Прати порака до корисник</h3>
                            {composeUser ? (
                              <p className="mt-1 text-sm text-slate-300">
                                {composeUser.name} · {composeUser.email} · <span className="text-blue-400 font-semibold">IDP: {composeUser.id}</span>
                              </p>
                            ) : (
                              <p className="mt-1 text-sm text-slate-300">
                                Избрани корисници: {selectedUserIds.length}
                              </p>
                            )}
                            {composeUser && !composeUser.is_active && (
                              <p className="mt-2 text-xs font-medium text-amber-300">Овој профил е моментално деактивиран, но пораката сепак може да биде испратена.</p>
                            )}
                          </div>
                          <Button
                            type="button"
                            onClick={() => {
                              setComposeUser(null);
                              setSelectedUserIds([]);
                              setAdminMessageText('');
                            }}
                            className="admin-dark-button bg-slate-700 hover:bg-slate-600 text-white"
                          >
                            Затвори
                          </Button>
                        </div>

                        <div className="mt-4 space-y-2">
                          <label className="block text-sm font-semibold text-slate-200">Порака</label>
                          <textarea
                            value={adminMessageText}
                            onChange={(e) => setAdminMessageText(e.target.value)}
                            placeholder="Напиши предупредување, информација, барање за корекција или порака поврзана со профилот."
                            rows={5}
                            className="w-full rounded-lg border border-[#2a3f55] bg-[#0b1727] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                          />
                        </div>

                        <div className="mt-4 flex gap-2">
                          <Button disabled={busy || !adminMessageText.trim()} className="admin-dark-button bg-cyan-600 hover:bg-cyan-500 text-white">
                            {busy ? 'Се праќа...' : 'Испрати порака'}
                          </Button>
                        </div>
                      </form>
                    )}

                    <div className="mt-5 space-y-3">
                      <div className="flex flex-col gap-3 rounded-xl border border-[#2a3f55] bg-[#0b1727] px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-3 text-sm font-semibold text-slate-200">
                            <input
                              type="checkbox"
                              checked={allVisibleSelected}
                              onChange={toggleSelectAllVisibleUsers}
                              className="h-4 w-4 rounded border border-[#3a5276] bg-[#081223]"
                            />
                            Select all
                          </label>
                          <span className="text-sm text-slate-400">
                            Избрани: {selectedUserIds.length}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            disabled={!selectedUserIds.length}
                            onClick={() => setComposeUser(null)}
                            className="admin-dark-button bg-cyan-700 hover:bg-cyan-600 text-white disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Прати известување
                          </Button>
                          {!!selectedUserIds.length && (
                            <Button
                              type="button"
                              onClick={() => setSelectedUserIds([])}
                              className="admin-dark-button bg-slate-700 hover:bg-slate-600 text-white"
                            >
                              Исчисти избор
                            </Button>
                          )}
                        </div>
                      </div>

                      {users.slice(0, adminPerPage).map((user) => (
                        <div key={user.id} className="rounded-xl border-2 border-[#2d4a6a] bg-[#0b1727] p-4">
                          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                            <div className="grid flex-1 gap-3 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto]">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  {user.role !== 'admin' && (
                                    <label className="mr-1 flex items-center">
                                      <input
                                        type="checkbox"
                                        checked={selectedUserIds.includes(user.id)}
                                        onChange={() => toggleUserSelection(user.id)}
                                        className="h-4 w-4 rounded border border-[#3a5276] bg-[#081223]"
                                      />
                                    </label>
                                  )}
                                  <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                                  <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-400">
                                    IDP: {user.id}
                                  </span>
                                  <span
                                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                      user.role === 'admin'
                                        ? dark
                                          ? 'border border-amber-500/40 bg-amber-500/10 text-amber-300'
                                          : 'border border-amber-400/80 bg-amber-50 text-amber-900'
                                        : user.is_active
                                          ? dark
                                            ? 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                                            : 'border border-emerald-400/80 bg-emerald-50 text-emerald-900'
                                          : dark
                                            ? 'border border-rose-500/40 bg-rose-500/10 text-rose-300'
                                            : 'border border-rose-400/80 bg-rose-50 text-rose-900'
                                    }`}
                                  >
                                    {user.role === 'admin' ? 'Admin' : user.is_active ? 'Активен' : 'Деактивиран'}
                                  </span>
                                </div>
                                <p className="mt-2 text-sm text-slate-300">{user.email}</p>
                                <p className="mt-1 text-sm text-slate-500">
                                  {user.phone || 'Нема телефон'}{user.location ? ` · ${user.location}` : ''}
                                </p>
                              </div>

                              <div className="grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
                                <div className="rounded-lg border border-[#2a3f55] bg-[#081223] px-3 py-2">
                                  <p className="text-xs uppercase tracking-wide text-slate-500">Регистрација</p>
                                  <p className="mt-1 font-medium text-white">{new Date(user.created_at).toLocaleString('mk-MK')}</p>
                                </div>
                                <div className="rounded-lg border border-[#2a3f55] bg-[#081223] px-3 py-2">
                                  <p className="text-xs uppercase tracking-wide text-slate-500">Огласи</p>
                                  <p className="mt-1 font-medium text-white">{user.ads_count}</p>
                                </div>
                              </div>

                              <div className="rounded-lg border border-[#2a3f55] bg-[#081223] px-3 py-2 text-sm">
                                <p className="text-xs uppercase tracking-wide text-slate-500">Рејтинг</p>
                                <p className="mt-1 font-medium text-white">
                                  {(user.rating ?? 5).toFixed(1)} / 5
                                  <span className="ml-2 text-slate-500">({user.reviews_count || 0} рецензии)</span>
                                </p>
                              </div>
                            </div>

                            <div className="-mt-1 grid shrink-0 grid-cols-2 gap-2 self-start">
                              <Button
                                type="button"
                                onClick={() => {
                                  setAuditUser(null);
                                  setAuditMessages([]);
                                  setComposeUser({
                                    id: user.id,
                                    name: user.name,
                                    email: user.email,
                                    is_active: user.is_active,
                                  });
                                  setAdminMessageText('');
                                }}
                                className="admin-dark-button bg-cyan-700 px-3 py-2 hover:bg-cyan-600 text-white"
                              >
                                Прати порака
                              </Button>
                              <Button
                                type="button"
                                disabled={busy || user.role === 'admin'}
                                onClick={() => toggleUserActive(user)}
                                className={`admin-dark-button px-3 py-2 text-white ${
                                  user.role === 'admin'
                                    ? 'cursor-not-allowed bg-slate-700 opacity-60'
                                    : user.is_active
                                      ? 'bg-rose-700 hover:bg-rose-600'
                                      : 'bg-emerald-700 hover:bg-emerald-600'
                                }`}
                              >
                                {user.role === 'admin' ? 'Admin профил' : user.is_active ? 'Деактивирај' : 'Активирај'}
                              </Button>
                              <Button
                                type="button"
                                onClick={() =>
                                  openUserMessages({
                                    id: user.id,
                                    name: user.name,
                                    email: user.email,
                                    is_active: user.is_active,
                                  })
                                }
                                className="admin-dark-button col-start-2 bg-indigo-700 px-3 py-2 hover:bg-indigo-600 text-white"
                              >
                                Пораки
                              </Button>
                            </div>
                          </div>

                          {auditUser?.id === user.id && (
                            <div className="mt-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-4">
                              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                  <h3 className="text-lg font-bold text-white">Пораки од и до корисник</h3>
                                  <p className="mt-1 text-sm text-slate-300">
                                    {auditUser.name} · {auditUser.email} · <span className="text-blue-400 font-semibold">IDP: {auditUser.id}</span>
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  onClick={() => {
                                    setAuditUser(null);
                                    setAuditMessages([]);
                                  }}
                                  className="admin-dark-button bg-slate-700 hover:bg-slate-600 text-white"
                                >
                                  Затвори
                                </Button>
                              </div>

                              <div className="mt-4 space-y-3">
                                {auditLoading ? (
                                  <div className="rounded-xl border border-[#2a3f55] bg-[#0b1727] px-5 py-8 text-center text-sm text-slate-300">
                                    Се вчитуваат пораките...
                                  </div>
                                ) : auditMessages.length === 0 ? (
                                  <div className="rounded-xl border border-dashed border-[#2a3f55] bg-[#0b1727] px-5 py-8 text-center text-sm text-slate-400">
                                    Овој корисник сè уште нема пораки за преглед.
                                  </div>
                                ) : (
                                  auditMessages.map((item) => {
                                    const isOutgoing = item.sender_id === auditUser.id;
                                    return (
                                      <div key={item.id} className="rounded-xl border border-[#2a3f55] bg-[#0b1727] px-4 py-3">
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                          <div>
                                            <p className="text-sm font-semibold text-white">
                                              {isOutgoing ? 'Пратена порака' : 'Примена порака'}
                                              <span className="ml-2 text-xs font-medium text-slate-400">
                                                {isOutgoing
                                                  ? `до ${item.receiver_name || 'непознат корисник'}`
                                                  : `од ${item.sender_name || 'непознат корисник'}`}
                                              </span>
                                            </p>
                                            {item.product_title && (
                                              <p className="mt-1 text-xs text-cyan-300">Оглас: {item.product_title}</p>
                                            )}
                                          </div>
                                          <p className="text-xs text-slate-400">{new Date(item.created_at).toLocaleString('mk-MK')}</p>
                                        </div>
                                        <p className="mt-3 break-all whitespace-pre-wrap text-sm leading-6 text-slate-200">{item.content}</p>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {users.length === 0 && (
                        <div className="rounded-xl border border-dashed border-[#2a3f55] bg-[#0b1727] px-5 py-10 text-center text-sm text-slate-400">
                          Нема корисници што одговараат на пребарувањето или филтерот.
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {activeTab === 'categories' && (
                <section className="grid gap-5 lg:grid-cols-[360px_1fr]">
                  <div className="space-y-5">
                    <form onSubmit={submitCategory} className="rounded-xl border border-[#2a3f55] bg-[#081223] p-5 space-y-3">
                      <div>
                        <h2 className="text-lg font-bold">{editingCategoryId ? 'Уреди категорија' : 'Нова категорија'}</h2>
                        {editingCategoryId && <p className="mt-1 text-xs text-slate-400">Кога ќе го смениш slug-от, системот ќе ги префрли и огласите што ја користат оваа категорија.</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-200">Име</label>
                        <Input placeholder="на пр. Електрични возила" value={categoryForm.name} onChange={(e) => handleCategoryNameChange(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-200">Slug</label>
                        <Input
                          placeholder="се пополнува автоматски, на пр. elektricni-vozila"
                          value={categoryForm.slug}
                          onChange={(e) => {
                            setCategorySlugTouched(true);
                            setCategoryForm((prev) => ({ ...prev, slug: slugify(e.target.value) }));
                          }}
                        />
                        <p className="text-xs text-slate-400">Ова е адресата во линкот. Системот сам го прави од името, а можеш и рачно да го смениш.</p>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-200">Икона</label>
                        <select
                          value={categoryForm.icon}
                          onChange={(e) => setCategoryForm((prev) => ({ ...prev, icon: e.target.value }))}
                          className="h-11 w-full rounded-lg border border-[#2a3f55] bg-[#0b1727] px-3 text-sm text-white"
                        >
                          <option value="layout-grid">Основна икона</option>
                          {CATEGORY_ICON_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                        <p className="text-xs text-slate-400">Избери ја иконата што најмногу одговара на категоријата.</p>
                      </div>
                      {editingCategoryId && (
                        <label className="flex items-center gap-3 rounded-lg border border-[#2a3f55] bg-[#0b1727] px-4 py-3 text-sm text-slate-200">
                          <input
                            type="checkbox"
                            checked={categoryForm.isActive}
                            onChange={(e) => setCategoryForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                          />
                          Категоријата да биде активна
                        </label>
                      )}
                      <div className="flex gap-2">
                        <Button disabled={busy} className="admin-dark-button bg-red-600 hover:bg-red-700 text-white">
                          {editingCategoryId ? 'Зачувај измени' : 'Додај категорија'}
                        </Button>
                        {editingCategoryId && (
                          <Button type="button" onClick={cancelCategoryEdit} className="admin-dark-button bg-slate-700 hover:bg-slate-600 text-white">
                            Откажи
                          </Button>
                        )}
                      </div>
                    </form>

                    <form onSubmit={submitSubcategory} className="rounded-xl border border-[#2a3f55] bg-[#081223] p-5 space-y-3">
                      <div>
                        <h2 className="text-lg font-bold">{editingSubcategoryId ? 'Уреди подкатегорија' : 'Нова подкатегорија'}</h2>
                        {editingSubcategoryId && <p className="mt-1 text-xs text-slate-400">Slug промената ќе се префрли и на огласите што ја користат оваа подкатегорија.</p>}
                      </div>
                      <select
                        value={subcategoryForm.parentId}
                        onChange={(e) => setSubcategoryForm((prev) => ({ ...prev, parentId: e.target.value }))}
                        disabled={Boolean(editingSubcategoryId)}
                        className="h-11 w-full rounded-lg border border-[#2a3f55] bg-[#0b1727] px-3 text-sm text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="">Избери parent категорија</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                      {editingSubcategoryId && (
                        <p className="text-xs text-slate-400">Parent категоријата не се менува тука. Ако треба да се премести, прво креирај ја под новата категорија.</p>
                      )}
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-200">Име</label>
                        <Input placeholder="на пр. Скутери електрични" value={subcategoryForm.name} onChange={(e) => handleSubcategoryNameChange(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-200">Slug</label>
                        <Input
                          placeholder="се пополнува автоматски, на пр. skuteri-elektricni"
                          value={subcategoryForm.slug}
                          onChange={(e) => {
                            setSubcategorySlugTouched(true);
                            setSubcategoryForm((prev) => ({ ...prev, slug: slugify(e.target.value) }));
                          }}
                        />
                        <p className="text-xs text-slate-400">Исто како категоријата, ова е URL името за подкатегоријата.</p>
                      </div>
                      {editingSubcategoryId && (
                        <label className="flex items-center gap-3 rounded-lg border border-[#2a3f55] bg-[#0b1727] px-4 py-3 text-sm text-slate-200">
                          <input
                            type="checkbox"
                            checked={subcategoryForm.isActive}
                            onChange={(e) => setSubcategoryForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                          />
                          Подкатегоријата да биде активна
                        </label>
                      )}
                      <div className="flex gap-2">
                        <Button disabled={busy} className="admin-dark-button bg-red-600 hover:bg-red-700 text-white">
                          {editingSubcategoryId ? 'Зачувај измени' : 'Додај подкатегорија'}
                        </Button>
                        {editingSubcategoryId && (
                          <Button type="button" onClick={cancelSubcategoryEdit} className="admin-dark-button bg-slate-700 hover:bg-slate-600 text-white">
                            Откажи
                          </Button>
                        )}
                      </div>
                    </form>
                  </div>

                  <div className="rounded-xl border border-[#2a3f55] bg-[#081223] p-5">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <h2 className="text-lg font-bold">Постоечки категории</h2>
                      <select
                        value={categorySort}
                        onChange={(e) => setCategorySort(e.target.value as 'name_asc' | 'name_desc' | 'newest')}
                        className="rounded-lg border border-[#2a3f55] bg-[#0b1727] px-3 py-1.5 text-sm text-white"
                      >
                        <option value="newest">Најнови</option>
                        <option value="name_asc">Име (А-Ш)</option>
                        <option value="name_desc">Име (Ш-А)</option>
                      </select>
                    </div>
                    <div className="space-y-4">
                      {[...categories].sort((a, b) => {
                        if (categorySort === 'name_asc') return a.name.localeCompare(b.name, 'mk');
                        if (categorySort === 'name_desc') return b.name.localeCompare(a.name, 'mk');
                        return b.id - a.id;
                      }).slice(0, adminPerPage).map((category) => (
                        <div key={category.id} className="rounded-lg border border-[#2a3f55] bg-[#0b1727] p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <h3 className="font-semibold">{category.name}</h3>
                              <p className="text-sm text-slate-400">{category.slug}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button type="button" onClick={() => startEditCategory(category)} className="admin-dark-button bg-slate-700 hover:bg-slate-600 text-white">Уреди</Button>
                              <Button type="button" onClick={() => toggleCategory(category.id, false)} className="admin-dark-button bg-slate-700 hover:bg-slate-600 text-white">Сокриј</Button>
                              <Button type="button" onClick={() => deleteCategory(category.id)} className="admin-dark-button bg-red-700 hover:bg-red-600 text-white">Избриши</Button>
                            </div>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {category.subcategories.map((subcategory) => (
                              <div key={subcategory.id} className="flex items-center gap-2 rounded-full border border-[#2c4264] bg-[#122038] px-3 py-1 text-xs text-slate-200">
                                <span>{subcategory.name}</span>
                                <button
                                  type="button"
                                  onClick={() => startEditSubcategory(category, subcategory)}
                                  className={`font-semibold ${dark ? 'text-cyan-300 hover:text-cyan-200' : 'text-blue-800 hover:text-blue-900'}`}
                                >
                                  Уреди
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {activeTab === 'homepage' && (
                <section className="grid gap-5 lg:grid-cols-[440px_1fr]">
                  <div className="space-y-5">
                    <div className="rounded-xl border border-[#2a3f55] bg-[#081223] p-5">
                      <h2 className="text-lg font-bold">Уредување банери</h2>
                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        Овде се уредуваат трите live секции на почетната: горниот банер со категории, долниот info банер и долниот банер со категории под info банерот.
                      </p>
                      <ul className="mt-4 space-y-2 text-sm text-slate-300">
                        <li>• Избери кои категории да се прикажуваат горе над големиот банер</li>
                        <li>• Смени наслови и поднаслови во info банерот</li>
                        <li>• Избери кои категории да се прикажуваат во долниот банер под info делот</li>
                      </ul>
                    </div>

                    <form onSubmit={submitHomepageSections} className="space-y-5 rounded-xl border border-[#2a3f55] bg-[#081223] p-5">
                      <div className="space-y-3">
                        <div>
                          <h3 className="text-base font-bold">Горен банер со категории</h3>
                          <p className="mt-1 text-xs text-slate-400">Овие 5 категории се прикажуваат над големиот банер, до копчето „Сите категории“.</p>
                        </div>
                        <div className="grid gap-3">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <div key={`header-cat-${index}`} className="space-y-1.5">
                              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">Позиција {index + 1}</label>
                              <select
                                value={homepageSections.headerCategorySlugs[index] || ''}
                                onChange={(e) => updateHomepageCategorySlug('headerCategorySlugs', index, e.target.value)}
                                className="h-11 w-full rounded-lg border border-[#2a3f55] bg-[#0b1727] px-3 text-sm text-white"
                              >
                                <option value="">Избери категорија</option>
                                {categories.map((category) => (
                                  <option key={`header-option-${category.id}`} value={category.slug}>{category.name}</option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h3 className="text-base font-bold">Долен info банер</h3>
                          <p className="mt-1 text-xs text-slate-400">Смени го текстот што се прикажува во четирите info картички под големиот банер.</p>
                        </div>
                        <div className="grid gap-3">
                          {homepageSections.trustItems.map((item, index) => (
                            <div key={`${item.icon}-${index}`} className="rounded-lg border border-[#2a3f55] bg-[#0b1727] p-4">
                              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Info картичка {index + 1}</p>
                              <div className="space-y-3">
                                <Input
                                  placeholder="Наслов"
                                  value={item.title}
                                  onChange={(e) => updateTrustItem(index, 'title', e.target.value)}
                                />
                                <Input
                                  placeholder="Поднаслов"
                                  value={item.subtitle}
                                  onChange={(e) => updateTrustItem(index, 'subtitle', e.target.value)}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h3 className="text-base font-bold">Долен банер со категории</h3>
                          <p className="mt-1 text-xs text-slate-400">Овие 6 категории се прикажуваат под info банерот како category банер.</p>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {Array.from({ length: 6 }).map((_, index) => (
                            <div key={`home-cat-${index}`} className="space-y-1.5">
                              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">Позиција {index + 1}</label>
                              <select
                                value={homepageSections.homeCategorySlugs[index] || ''}
                                onChange={(e) => updateHomepageCategorySlug('homeCategorySlugs', index, e.target.value)}
                                className="h-11 w-full rounded-lg border border-[#2a3f55] bg-[#0b1727] px-3 text-sm text-white"
                              >
                                <option value="">Избери категорија</option>
                                {categories.map((category) => (
                                  <option key={`home-option-${category.id}`} value={category.slug}>{category.name}</option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button disabled={busy} className="admin-dark-button bg-red-600 hover:bg-red-700 text-white">
                          Зачувај уредување на банери
                        </Button>
                      </div>
                    </form>
                  </div>

                  <div className="space-y-5 rounded-xl border border-[#2a3f55] bg-[#081223] p-5">
                    <div>
                      <h2 className="text-lg font-bold">Преглед на секциите</h2>
                      <p className="mt-1 text-sm text-slate-400">Ова е брз преглед на моменталната структура на почетната страница.</p>
                    </div>

                    <div className="rounded-xl border border-[#2a3f55] bg-[#0b1727] p-4">
                      <h3 className="text-sm font-bold text-slate-200">Горен банер со категории</h3>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {homepageSections.headerCategorySlugs.map((slug, index) => {
                          const category = categories.find((item) => item.slug === slug);
                          return (
                            <span key={`header-preview-${slug || index}`} className="rounded-full border border-[#2c4264] bg-[#122038] px-3 py-1 text-xs text-slate-200">
                              {category?.name || `Празна позиција ${index + 1}`}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div className="rounded-xl border border-[#2a3f55] bg-[#0b1727] p-4">
                      <h3 className="text-sm font-bold text-slate-200">Долен info банер</h3>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        {homepageSections.trustItems.map((item, index) => (
                          <div key={`trust-preview-${index}`} className="rounded-lg border border-[#2c4264] bg-[#122038] p-3">
                            <p className="text-sm font-semibold text-white">{item.title}</p>
                            <p className="mt-1 text-xs text-slate-400">{item.subtitle}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-[#2a3f55] bg-[#0b1727] p-4">
                      <h3 className="text-sm font-bold text-slate-200">Долен банер со категории</h3>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                        {homepageSections.homeCategorySlugs.map((slug, index) => {
                          const category = categories.find((item) => item.slug === slug);
                          return (
                            <div key={`home-preview-${slug || index}`} className="rounded-lg border border-[#2c4264] bg-[#122038] px-3 py-2 text-xs text-slate-200">
                              {category?.name || `Празна позиција ${index + 1}`}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {activeTab === 'crm-drafts' && (
                <CrmDraftsTab />
              )}

              {activeTab === 'crm-published' && (
                <CrmPublishedTab />
              )}

              {activeTab === 'reports' && (
                <ReportsTab />
              )}

              {activeTab === 'banners' && (
                <section className="grid gap-5 lg:grid-cols-[420px_1fr]">
                  <div className="space-y-5">
                    <div className="rounded-xl border border-[#2a3f55] bg-[#081223] p-5">
                      <h2 className="text-lg font-bold">Голем банер</h2>
                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        Овој дел е наменет за промотивни банери што добиваат приоритетен простор на почетната страница и служат за поголема видливост на бренд, категорија, понуда или специјална кампања.
                      </p>
                      <ul className="mt-4 space-y-2 text-sm text-slate-300">
                        <li>• Топ прикажување на почетна страница</li>
                        <li>• Поголема изложеност пред сите посетители</li>
                        <li>• Идеално за истакнати понуди, промоции и рекламни кампањи</li>
                        <li>• Редоследот одредува кој банер добива прв приоритет</li>
                      </ul>
                    </div>

                    <form onSubmit={submitBanner} className="rounded-xl border border-[#2a3f55] bg-[#081223] p-5 space-y-4">
                      <div>
                        <h2 className="text-lg font-bold">{editingBannerId ? 'Уреди промотивен банер' : 'Нов промотивен банер'}</h2>
                        <p className="mt-1 text-sm text-slate-400">Препорачана димензија: 1600 x 400 px, JPG или PNG. Овие банери се користат за истакнување, рекламирање и приоритетно позиционирање на почетната страница.</p>
                        <p className="mt-1 text-xs text-slate-500">Правило: минимум 1 активен банер, максимум 10 активни банери. Помал редослед значи повисок приоритет.</p>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-200">Промотивна слика *</label>
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
                        <div>
                          <div className="relative overflow-hidden rounded-lg bg-[#0b1727] shadow-[inset_0_0_0_1px_#2a3f55]">
                            <div style={{ paddingBottom: '25%' }} />
                            <img src={bannerForm.image_url} alt="Preview банер" className="absolute inset-0 block h-full w-full object-cover object-center"
                              onLoad={(e) => {
                                const img = e.currentTarget;
                                setBannerDimensions((prev) => ({ ...prev, preview: { width: img.naturalWidth, height: img.naturalHeight } }));
                              }} />
                          </div>
                          {bannerDimensions.preview && (bannerDimensions.preview.width !== 1600 || bannerDimensions.preview.height !== 400) && (
                            <p className="mt-1 text-xs text-red-400">⚠ Овој банер не е 1600x400 (реално: {bannerDimensions.preview.width}x{bannerDimensions.preview.height})</p>
                          )}
                        </div>
                      )}

                      <Input placeholder="Линк при клик, на пр. /products?category=motorni-vozila или /sell (опционално)" value={bannerForm.link_url} onChange={(e) => setBannerForm((prev) => ({ ...prev, link_url: e.target.value }))} />
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-200">Приоритетен редослед</label>
                        <Input placeholder="на пр. 0 = прв, 1 = втор, 2 = трет" value={bannerForm.sort_order} onChange={(e) => setBannerForm((prev) => ({ ...prev, sort_order: e.target.value }))} />
                        <p className="text-xs text-slate-400">Колку е помал бројот, толку порано и поприоритетно ќе се прикаже банерот на почетна.</p>
                      </div>

                      <label className="flex items-center gap-3 rounded-lg border border-[#2a3f55] bg-[#0b1727] px-4 py-3 text-sm text-slate-200">
                        <input
                          type="checkbox"
                          checked={bannerForm.is_active}
                          onChange={(e) => setBannerForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                        />
                        Банерот да биде активен и видлив како промотивна позиција на почетна
                      </label>

                      <div className="flex gap-2">
                        <Button disabled={busy} className="admin-dark-button bg-red-600 hover:bg-red-700 text-white">
                          {editingBannerId ? 'Зачувај измени' : 'Додај промотивен банер'}
                        </Button>
                        {editingBannerId && (
                          <Button type="button" onClick={resetBannerForm} className="admin-dark-button bg-slate-700 hover:bg-slate-600 text-white">
                            Откажи
                          </Button>
                        )}
                      </div>
                    </form>
                  </div>

                  <div className="rounded-xl border border-[#2a3f55] bg-[#081223] p-5">
                    <h2 className="mb-4 text-lg font-bold">Активни и достапни промотивни позиции</h2>
                    <div className="space-y-4">
                      {banners.map((banner) => (
                        <div key={banner.id} className="rounded-lg border border-[#2a3f55] bg-[#0b1727] p-4">
                          <div className="flex flex-col gap-4 xl:flex-row">
                              <div className="relative overflow-hidden rounded-lg bg-[#081223] shadow-[inset_0_0_0_1px_#2a3f55] xl:w-[320px]">
                                <div style={{ paddingBottom: '25%' }} />
                                <img src={banner.image_url} alt={`Банер ${banner.id}`} className="absolute inset-0 block h-full w-full object-cover object-center"
                                  onLoad={(e) => {
                                    const img = e.currentTarget;
                                    setBannerDimensions((prev) => ({ ...prev, [String(banner.id)]: { width: img.naturalWidth, height: img.naturalHeight } }));
                                  }} />
                            </div>
                            {bannerDimensions[String(banner.id)] && (bannerDimensions[String(banner.id)]!.width !== 1600 || bannerDimensions[String(banner.id)]!.height !== 400) && (
                              <p className="mt-1 text-xs text-red-400">⚠ Не е 1600x400 (реално: {bannerDimensions[String(banner.id)]!.width}x{bannerDimensions[String(banner.id)]!.height})</p>
                            )}
                            <div className="flex-1">
                              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                  <h3 className="text-lg font-semibold">Промотивен банер #{banner.id}</h3>
                                  <p className="mt-2 text-xs text-slate-500">Приоритет: {banner.sort_order} · {banner.is_active ? 'Активен и видлив' : 'Скриен'}</p>
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

                      {banners.length === 0 && <p className="text-sm text-slate-400">Сè уште нема додадени промотивни банери.</p>}
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

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050b17] py-2.5 text-white md:py-3"><Container><p className="text-slate-400">Се вчитува...</p></Container></div>}>
      <AdminPageContent />
    </Suspense>
  );
}

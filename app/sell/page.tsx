'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ImagePlus, MapPin, Phone, ShieldCheck, Trash2, UploadCloud } from 'lucide-react';
import Link from 'next/link';
import Header from '../components/Header';
import { Container, Button, Input } from '../components/ui';
import { CATEGORIES } from '@/lib/categories';

type CategoryOption = {
  id: number;
  name: string;
  slug: string;
  icon: string;
  subcategories: Array<{ id: number; name: string; slug: string }>;
};

type FormData = {
  title: string;
  category: string;
  subcategory: string;
  condition: string;
  price: string;
  currency: string;
  negotiable: boolean;
  description: string;
  city: string;
  neighborhood: string;
  addressNote: string;
  delivery: string;
  contactName: string;
  phone: string;
  preferredContact: string;
  hasViber: boolean;
  hasWhatsapp: boolean;
  hasTelegram: boolean;
  hidePhone: boolean;
  tradePossible: boolean;
  emailNotifications: boolean;
};

const INITIAL_FORM: FormData = {
  title: '',
  category: '',
  subcategory: '',
  condition: 'Многу добро',
  price: '',
  currency: '€',
  negotiable: true,
  tradePossible: false,
  description: '',
  city: '',
  neighborhood: '',
  addressNote: '',
  delivery: 'Лично',
  contactName: '',
  phone: '',
  preferredContact: 'Телефон и порака',
  hasViber: false,
  hasWhatsapp: false,
  hasTelegram: false,
  hidePhone: false,
  emailNotifications: true,
};

const CONDITIONS = ['Ново', 'Како ново', 'Многу добро', 'Добро', 'Користено', 'За делови'];
const CURRENCIES = ['€', 'ден', '$'];
const DELIVERY_OPTIONS = ['Лично', 'Карго', 'По договор'];
const CONTACT_OPTIONS = ['Телефон и порака', 'Телефон', 'Порака во апликација'];
const CITIES = [
  'Скопје',
  'Битола',
  'Куманово',
  'Прилеп',
  'Тетово',
  'Велес',
  'Штип',
  'Охрид',
  'Гостивар',
  'Струмица',
  'Кавадарци',
  'Кочани',
  'Кичево',
  'Струга',
  'Радовиш',
  'Гевгелија',
  'Дебар',
  'Крива Паланка',
  'Свети Николе',
  'Неготино',
  'Делчево',
  'Виница',
  'Ресен',
  'Пробиштип',
  'Берово',
  'Кратово',
  'Крушево',
  'Македонски Брод',
  'Валандово',
  'Демир Хисар',
];
const fieldClass = '!bg-[#0b1727] !border-[#2a3f55] !text-white !placeholder:text-slate-500 focus:!border-red-500 focus:!ring-red-500/20';

const selectClass = 'h-12 w-full rounded-lg border border-[#2a3f55] bg-[#0b1727] px-3 text-sm text-white outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20';

const fieldErrorClass = '!bg-[#0b1727] !border-red-500 !ring-2 !ring-red-500/40 !text-white !placeholder:text-slate-500 focus:!border-red-500 focus:!ring-red-500/20';

const selectErrorClass = 'h-12 w-full rounded-lg border border-red-500 bg-[#0b1727] px-3 text-sm text-white outline-none transition ring-2 ring-red-500/40 focus:border-red-500 focus:ring-2 focus:ring-red-500/20';
const labelClass = 'mb-2 block text-sm font-semibold text-slate-100';

export default function SellPage() {
  const router = useRouter();

  useEffect(() => {
    const user = typeof window !== 'undefined' ? JSON.parse(window.localStorage.getItem('user') || 'null') : null;
    if (user?.email) setUserEmail(user.email);
    if (!user) {
      router.push('/auth');
    }
  }, [router]);

  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [newProductId, setNewProductId] = useState<number | null>(null);
  const [wasValidated, setWasValidated] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [categories, setCategories] = useState<CategoryOption[]>(
    CATEGORIES.map((category, index) => ({
      id: index + 1,
      name: category.name,
      slug: category.slug,
      icon: category.icon,
      subcategories: category.subcategories.map((subcategory, subIndex) => ({
        id: Number(`${index + 1}${subIndex + 1}`),
        name: subcategory.name,
        slug: subcategory.slug,
      })),
    })),
  );

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

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const editId = new URLSearchParams(window.location.search).get('edit');
    const parsedEditId = editId ? Number(editId) : null;
    if (parsedEditId && Number.isFinite(parsedEditId)) {
      setEditingProductId(parsedEditId);
      setLoadingEdit(true);
    } else {
      setEditingProductId(null);
      setLoadingEdit(false);
    }
  }, []);

  useEffect(() => {
    if (!editingProductId || Number.isNaN(editingProductId)) {
      setLoadingEdit(false);
      return;
    }

    let cancelled = false;

    const loadProduct = async () => {
      try {
        setLoadingEdit(true);
        const response = await fetch(`/api/products/${editingProductId}?all=1`);
        if (!response.ok) {
          throw new Error('Не успеа да се вчита огласот за уредување');
        }

        const product = await response.json();
        if (cancelled || !product?.id) return;

        setFormData({
          title: product.title || '',
          category: product.category || '',
          subcategory: product.subcategory || '',
          condition: product.condition || '',
          price: product.price ? String(product.price) : '',
          currency: product.currency || '€',
          negotiable: Boolean(product.negotiable),
          description: product.description || '',
          city: product.city || '',
          neighborhood: product.neighborhood || '',
          addressNote: product.address_note || '',
          delivery: product.delivery || 'Лично',
          contactName: product.contact_name || '',
          phone: product.contact_phone || '',
          preferredContact: product.preferred_contact || 'Телефон и порака',
          hasViber: Boolean(product.has_viber),
          hasWhatsapp: Boolean(product.has_whatsapp),
          hasTelegram: Boolean(product.has_telegram),
          hidePhone: Boolean(product.hide_phone),
          tradePossible: Boolean(product.trade_possible),
          emailNotifications: true,
        });

        const loadedImages = Array.isArray(product.images) && product.images.length > 0
          ? product.images
          : product.image_url
            ? [product.image_url]
            : [];
        setImagePreviews(loadedImages);
      } catch (error) {
        console.error(error);
        setStatusMessage('Не успеа вчитувањето на огласот за уредување.');
      } finally {
        if (!cancelled) setLoadingEdit(false);
      }
    };

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [editingProductId]);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? JSON.parse(window.localStorage.getItem('user') || '{}') : {};
    if (stored?.name || stored?.phone || stored?.location) {
      setFormData(prev => ({
        ...prev,
        contactName: prev.contactName || stored.name || '',
        phone: prev.phone || stored.phone || '',
        city: prev.city || stored.location || '',
      }));
    }
  }, []);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.slug === formData.category),
    [categories, formData.category],
  );

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []).slice(0, Math.max(0, 8 - imagePreviews.length));
    if (files.length === 0) return;

    const previews = await Promise.all(
      files.map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
          }),
      ),
    );

    setImagePreviews((prev) => [...prev, ...previews].slice(0, 8));
    event.target.value = '';
  };

  const removeImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWasValidated(true);
    setSubmitting(true);
    setStatusMessage(null);

    try {
      const currentUser = typeof window !== 'undefined' ? JSON.parse(window.localStorage.getItem('user') || '{}') : {};
      const sellerId = currentUser?.id || 1;
      const resolvedContactPhone = formData.phone.trim() || currentUser?.phone || '';
      const isEditing = Boolean(editingProductId);
      const response = await fetch(isEditing ? `/api/products/${editingProductId}` : '/api/products', {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title.trim(),
          price: Number(formData.price),
          currency: formData.currency,
          description: formData.description.trim(),
          category: formData.category,
          subcategory: formData.subcategory,
          condition: formData.condition,
          negotiable: formData.negotiable,
          city: formData.city,
          neighborhood: formData.neighborhood,
          address_note: formData.addressNote,
          delivery: formData.delivery,
          contact_name: formData.contactName,
          contact_phone: resolvedContactPhone,
          contact_email: formData.emailNotifications ? (currentUser.email || null) : null,
          preferred_contact: formData.preferredContact,
          has_viber: formData.hasViber,
          has_whatsapp: formData.hasWhatsapp,
          has_telegram: formData.hasTelegram,
          hide_phone: formData.hidePhone ? 1 : 0,
          trade_possible: formData.tradePossible,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || 'Огласот не беше зачуван');
      }

      const result = await response.json();
      if (!editingProductId) {
        setSuccess(true);
        setNewProductId(result.id);
      }
      setStatusMessage(
        editingProductId ? 'Огласот е успешно ажуриран. Треба повторно да биде одобрен од admin.' : 'Вашиот оглас е успешно внесен. Ќе биде одобрен од admin во најбрз можен рок.',
      );
      if (editingProductId) {
        router.push(`/products/${editingProductId}?seller_id=${sellerId}`);
      } else {
        setFormData(INITIAL_FORM);
        setImagePreviews([]);
      }
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Грешка при објавување на огласот.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#050b17] py-8 text-white">
        <Container>
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{editingProductId ? 'Уреди оглас' : 'Внеси оглас'}</h1>
              <p className="mt-1 text-sm text-slate-400">Пополнет и јасен оглас добива повеќе јавувања и пораки.</p>
            </div>
            <div className="sell-safe-badge inline-flex items-center gap-2 rounded-lg border border-green-500/25 bg-green-500/10 px-3 py-2 text-sm text-green-200">
              <ShieldCheck className="h-4 w-4" /> {editingProductId ? 'Режим на уредување' : 'Безбедно објавување'}
            </div>
          </div>

          {success && !editingProductId ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-8">
                <CheckCircle2 className="mx-auto h-12 w-12 text-green-400" />
                <h2 className="mt-4 text-xl font-bold text-white">Успешно објавен оглас!</h2>
                <p className="mt-2 text-sm text-slate-300">Вашиот оглас е успешно внесен. Ќе биде одобрен од admin во најбрз можен рок.</p>
                <div className="mt-6 flex flex-col items-center gap-3">
                  {newProductId && (
                    <Link href={`/products/${newProductId}?seller_id=${typeof window !== 'undefined' ? (JSON.parse(window.localStorage.getItem('user') || '{}')?.id || '') : ''}`} className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700 transition">
                      Погледни го огласот
                    </Link>
                  )}
                  <Link href="/sell" className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-6 py-3 text-sm font-semibold text-white hover:bg-sky-700 transition">
                    Внеси нов оглас
                  </Link>
                  <Link href="/" className="text-sm text-sky-400 hover:text-sky-300 underline underline-offset-2">
                    Врати се на почетна
                  </Link>
                </div>
              </div>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-[1fr_320px]">
            <div className="space-y-5">
              <section className="rounded-lg border border-[#2a3f55] bg-[#081223] p-5">
                <h2 className="text-lg font-bold">Основни информации</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className={labelClass}>Наслов на оглас *</label>
                    <Input
                      required
                      minLength={5}
                      value={formData.title}
                      onChange={(e) => updateField('title', e.target.value)}
                      placeholder="на пр. iPhone 15 Pro 256GB, одлична состојба"
                      className={fieldClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Категорија *</label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => {
                        updateField('category', e.target.value);
                        updateField('subcategory', '');
                      }}
                      className={selectClass}
                    >
                      <option value="">Избери категорија</option>
                      {categories.map((category) => (
                        <option key={category.slug} value={category.slug}>{category.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Подкатегорија *</label>
                    <select
                      required
                      value={formData.subcategory}
                      disabled={!selectedCategory}
                      onChange={(e) => updateField('subcategory', e.target.value)}
                      className={selectClass}
                    >
                      <option value="">Избери подкатегорија</option>
                      {selectedCategory?.subcategories.map((subcategory) => (
                        <option key={subcategory.slug} value={subcategory.slug}>{subcategory.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Состојба *</label>
                    <select
                      required
                      value={formData.condition}
                      onChange={(e) => updateField('condition', e.target.value)}
                      className={selectClass}
                    >
                      <option value="">Избери состојба</option>
                      {CONDITIONS.map((condition) => (
                        <option key={condition} value={condition}>{condition}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-[1fr_96px] gap-3">
                    <div>
                      <label className={labelClass}>Цена *</label>
                      <Input
                        required
                        min="0"
                        step="1"
                        type="number"
                        value={formData.price}
                        onChange={(e) => updateField('price', e.target.value)}
                        placeholder="100"
                        className={fieldClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Валута</label>
                      <select value={formData.currency} onChange={(e) => updateField('currency', e.target.value)} className={selectClass}>
                        {CURRENCIES.map((currency) => (
                          <option key={currency} value={currency}>{currency}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 md:col-span-2">
                    <label className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-3 text-sm transition ${formData.negotiable ? 'border-orange-500 bg-orange-500/10 text-orange-200' : 'border-[#2a3f55] bg-[#0b1727] text-slate-200'}`}>
                      <input type="radio" name="priceType" checked={formData.negotiable} onChange={() => updateField('negotiable', true)} className="h-4 w-4 accent-orange-500" />
                      Цена по договор
                    </label>
                    <label className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-3 text-sm transition ${!formData.negotiable ? 'border-red-500 bg-red-500/10 text-red-200' : 'border-[#2a3f55] bg-[#0b1727] text-slate-200'}`}>
                      <input type="radio" name="priceType" checked={!formData.negotiable} onChange={() => updateField('negotiable', false)} className="h-4 w-4 accent-red-600" />
                      Цената е фиксна
                    </label>
                    <label className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-3 text-sm transition ${formData.tradePossible ? 'border-emerald-500 bg-emerald-500/10 text-emerald-200' : 'border-[#2a3f55] bg-[#0b1727] text-slate-200'}`}>
                      <input type="checkbox" checked={formData.tradePossible} onChange={(e) => updateField('tradePossible', e.target.checked)} className="h-4 w-4 accent-emerald-500" />
                      Можна замена
                    </label>
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-[#2a3f55] bg-[#081223] p-5">
                <h2 className="text-lg font-bold">Слики</h2>
                <p className="mt-1 text-sm text-slate-400">Додај до 8 слики. Првата слика што ќе ја ставиш ќе биде главна.</p>

                <label className="mt-4 flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[#365273] bg-[#0b1727] px-4 py-6 text-center transition hover:border-red-500/70 hover:bg-[#111f33]">
                  <UploadCloud className="h-9 w-9 text-red-400" />
                  <span className="mt-2 text-sm font-semibold text-white">Прикачи слики</span>
                  <span className="mt-1 text-xs text-slate-400">JPG, PNG или WebP</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                </label>

                {imagePreviews.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {imagePreviews.map((image, index) => (
                      <div key={`${image.slice(0, 24)}-${index}`} className="relative overflow-hidden rounded-lg border border-[#2a3f55] bg-[#0b1727]">
                        <img src={image} alt={`Слика ${index + 1}`} className="h-28 w-full object-cover" />
                        {index === 0 && <span className="absolute left-2 top-2 rounded bg-red-600 px-2 py-0.5 text-[11px] font-bold">Главна</span>}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute right-2 top-2 rounded bg-black/60 p-1 text-white hover:bg-red-600"
                          aria-label="Отстрани слика"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="rounded-lg border border-[#2a3f55] bg-[#081223] p-5">
                <h2 className="text-lg font-bold">Опис и детали</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className={labelClass}>Опис *</label>
                    <textarea
                      required
                      minLength={5}
                      value={formData.description}
                      onChange={(e) => updateField('description', e.target.value)}
                      placeholder="Опиши состојба, старост, гаранција, што е вклучено, причина за продажба..."
                    className="min-h-40 w-full resize-y rounded-lg border border-[#2a3f55] bg-[#0b1727] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                  />
                  </div>

                  <div>
                    <label className={labelClass}>Начин на преземање *</label>
                    <select required value={formData.delivery} onChange={(e) => updateField('delivery', e.target.value)} className={selectClass}>
                      {DELIVERY_OPTIONS.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Префериран контакт</label>
                    <select value={formData.preferredContact} onChange={(e) => updateField('preferredContact', e.target.value)} className={selectClass}>
                      {CONTACT_OPTIONS.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-[#2a3f55] bg-[#081223] p-5">
                <h2 className="text-lg font-bold">Локација и контакт</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelClass}>Град *</label>
                    <select required value={formData.city} onChange={(e) => updateField('city', e.target.value)} className={selectClass}>
                      <option value="">Избери град</option>
                      {CITIES.map((city) => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Населба / реон</label>
                    <Input value={formData.neighborhood} onChange={(e) => updateField('neighborhood', e.target.value)} placeholder="на пр. Аеродром" className={fieldClass} />
                  </div>

                  <div>
                    <label className={labelClass}>Контакт лице</label>
                    <Input value={formData.contactName} onChange={(e) => updateField('contactName', e.target.value)} placeholder="Твоето име" className={fieldClass} />
                  </div>

                  <div>
                    <label className={labelClass}>Телефон *</label>
                    <Input required type="tel" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="+389 70 123 456" className={fieldClass} />
                    <div className="mt-2 flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.hasViber} onChange={(e) => updateField('hasViber', e.target.checked)} className="h-4 w-4 rounded border-[#3a5276] bg-[#081223]" />
                        <span className="text-sm font-semibold text-purple-300">Имам Viber</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.hasWhatsapp} onChange={(e) => updateField('hasWhatsapp', e.target.checked)} className="h-4 w-4 rounded border-[#3a5276] bg-[#081223]" />
                        <span className="text-sm font-semibold text-emerald-300">WhatsApp</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.hasTelegram} onChange={(e) => updateField('hasTelegram', e.target.checked)} className="h-4 w-4 rounded border-[#3a5276] bg-[#081223]" />
                        <span className="text-sm font-semibold text-sky-300">Telegram</span>
                      </label>
                    </div>
                    <label className="mt-4 flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.hidePhone} onChange={(e) => updateField('hidePhone', e.target.checked)} className="h-4 w-4 rounded border-[#3a5276] bg-[#081223]" />
                      <span className="text-sm text-slate-400">Не прикажувај телефон</span>
                    </label>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.emailNotifications} onChange={(e) => updateField('emailNotifications', e.target.checked)} className="h-4 w-4 rounded border-[#3a5276] bg-[#081223]" />
                      <span className="text-sm text-slate-400">Испрати ми email известувања</span>
                    </label>
                    <p className="mt-1 text-xs text-slate-500">Известувањата ќе се испраќаат на: {userEmail}</p>
                  </div>

                  <div className="flex items-end">
                    <Button
                      type="submit"
                      disabled={submitting || loadingEdit}
                      className="h-12 w-full bg-red-600 text-base font-bold hover:bg-red-700 disabled:bg-slate-700"
                    >
                      {submitting ? (editingProductId ? 'Зачувување...' : 'Објавување...') : editingProductId ? 'Зачувај измени' : 'Објави оглас'}
                    </Button>
                  </div>
                </div>
              </section>
            </div>

            <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-lg border border-[#2a3f55] bg-[#081223] p-4">
                <h2 className="text-base font-bold">Преглед</h2>
                <div className="mt-4 overflow-hidden rounded-lg border border-[#2a3f55] bg-[#0b1727]">
                  {imagePreviews[0] ? (
                    <img src={imagePreviews[0]} alt="Главна слика" className="h-44 w-full object-cover" />
                  ) : (
                    <div className="flex h-44 items-center justify-center text-slate-500">
                      <ImagePlus className="h-10 w-10" />
                    </div>
                  )}
                  <div className="p-3">
                    <p className="line-clamp-2 font-semibold text-white">{formData.title || 'Наслов на огласот'}</p>
                    <p className="mt-2 text-xl font-bold text-red-500">
                      {formData.price ? Number(formData.price).toLocaleString() : '0'} €
                    </p>
                    <p className="mt-2 flex items-center gap-1 text-xs text-slate-400">
                      <MapPin className="h-3.5 w-3.5" /> {formData.city || 'Локација'}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                      <Phone className="h-3.5 w-3.5" /> {formData.phone || 'Телефон'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm text-slate-300">
                  <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-400" /> Јасен наслов</p>
                  <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-400" /> Реална цена</p>
                  <p className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-400" /> Добри слики</p>
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting || loadingEdit}
                className="h-12 w-full bg-red-600 text-base font-bold hover:bg-red-700 disabled:bg-slate-700"
              >
                {submitting ? (editingProductId ? 'Зачувување...' : 'Објавување...') : editingProductId ? 'Зачувај измени' : 'Објави оглас'}
              </Button>
            </aside>
          </form>
          )}
        </Container>
      </main>
    </>
  );
}

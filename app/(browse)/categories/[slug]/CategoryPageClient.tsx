'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { X } from 'lucide-react';
import AdCard from '@/app/components/AdCard';
import { Container, Input, Button } from '@/app/components/ui';
import { CATEGORIES } from '@/lib/categories';
import { normalizeCategorySlug } from '@/lib/category-aliases';

type CategoryOption = {
  id: number;
  name: string;
  slug: string;
  icon: string;
  subcategories: Array<{ id: number; name: string; slug: string }>;
};

type Product = {
  id: number;
  title: string;
  price: number;
  currency?: string;
  description?: string;
  category: string;
  subcategory?: string | null;
  location?: string | null;
  city?: string | null;
  image_url?: string | null;
  images?: string[];
  seller_rating?: number;
  created_at?: string;
  sold_at?: string | null;
};

function formatFallbackName(slug: string) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function CategoryPageClient({ slug, initialCategoryName }: { slug: string; initialCategoryName?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const normalizedSlug = normalizeCategorySlug(slug);
  const [categories, setCategories] = useState<CategoryOption[]>(CATEGORIES as CategoryOption[]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [perPage, setPerPage] = useState(30);
  const [categoryName, setCategoryName] = useState(initialCategoryName || '');

  const search = searchParams.get('search');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const page = searchParams.get('page');

  const matchedCategory = useMemo(() => {
    for (const category of categories) {
      const normalizedCategory = normalizeCategorySlug(category.slug);
      if (normalizedCategory === normalizedSlug) {
        return { type: 'category' as const, name: category.name, slug: category.slug };
      }

      const matchedSubcategory = category.subcategories.find((sub) => normalizeCategorySlug(sub.slug) === normalizedSlug);
      if (matchedSubcategory) {
        return {
          type: 'subcategory' as const,
          name: matchedSubcategory.name,
          slug: matchedSubcategory.slug,
          parentSlug: category.slug,
          parentName: category.name,
        };
      }
    }

    return null;
  }, [categories, normalizedSlug]);

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
    if (matchedCategory?.type === 'category' || matchedCategory?.type === 'subcategory') {
      setCategoryName(matchedCategory.name);
      return;
    }

    setCategoryName(initialCategoryName || formatFallbackName(normalizedSlug));
  }, [initialCategoryName, matchedCategory, normalizedSlug]);

  useEffect(() => {
    const pageNumber = Math.max(parseInt(page || '1', 10) || 1, 1);
    const controller = new AbortController();

    async function fetchProducts() {
      setLoading(true);

      try {
        const apiParams = new URLSearchParams();
        apiParams.set('limit', String(perPage));
        apiParams.set('offset', String((pageNumber - 1) * perPage));

        if (matchedCategory?.type === 'subcategory') {
          apiParams.set('sub', matchedCategory.slug);
        } else {
          apiParams.set('category', matchedCategory?.slug || normalizedSlug);
        }

        if (search) apiParams.set('search', search);
        if (minPrice) apiParams.set('minPrice', minPrice);
        if (maxPrice) apiParams.set('maxPrice', maxPrice);

        const response = await fetch(`/api/products?${apiParams.toString()}`, {
          signal: controller.signal,
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Не можам да ги вчитам огласите.');
        }

        const data = await response.json();
        const nextProducts = Array.isArray(data.products) ? data.products : [];
        const total = Number(data.total || 0);

        setProducts(nextProducts);
        setTotalProducts(total);
        setTotalPages(Math.max(Math.ceil(total / perPage), 1));
        setCurrentPage(pageNumber);
      } catch (fetchError) {
        if ((fetchError as Error).name !== 'AbortError') {
          console.error('Error fetching category products:', fetchError);
          setProducts([]);
          setTotalProducts(0);
          setTotalPages(1);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => controller.abort();
  }, [matchedCategory, normalizedSlug, search, minPrice, maxPrice, page, perPage]);

  const removeFilter = (filterType: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete(filterType);
    newParams.delete('page');
    router.push(`/categories/${normalizedSlug}?${newParams.toString()}`);
  };

  const goToPage = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    if (newPage === 1) {
      newParams.delete('page');
    } else {
      newParams.set('page', newPage.toString());
    }
    router.push(`/categories/${normalizedSlug}?${newParams.toString()}`);
  };

  return (
    <Container className="py-8 text-white">
      <div className="mb-8">
        <h1 className="mb-4 text-2xl font-bold text-white">{categoryName}</h1>

        {(search || minPrice || maxPrice) && (
          <div className="mb-4 flex flex-wrap gap-2">
            {search && (
              <div className="flex items-center gap-2 rounded-full border border-[#2a3f60] bg-[#122038] px-3 py-1 text-sm text-slate-200">
                <span>Пребарување: {search}</span>
                <button onClick={() => removeFilter('search')} className="text-slate-400 hover:text-white" aria-label="Отстрани пребарување">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            {minPrice && (
              <div className="flex items-center gap-2 rounded-full border border-[#2a3f60] bg-[#122038] px-3 py-1 text-sm text-slate-200">
                <span>От {minPrice} ден.</span>
                <button onClick={() => removeFilter('minPrice')} className="text-slate-400 hover:text-white" aria-label="Отстрани минимална цена">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            {maxPrice && (
              <div className="flex items-center gap-2 rounded-full border border-[#2a3f60] bg-[#122038] px-3 py-1 text-sm text-slate-200">
                <span>До {maxPrice} ден.</span>
                <button onClick={() => removeFilter('maxPrice')} className="text-slate-400 hover:text-white" aria-label="Отстрани максимална цена">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-3 md:flex-row">
          <Input
            type="text"
            placeholder="Барај во оваа категорија..."
            defaultValue={search || ''}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const newParams = new URLSearchParams(searchParams);
                const value = (e.target as HTMLInputElement).value;
                if (value) {
                  newParams.set('search', value);
                } else {
                  newParams.delete('search');
                }
                newParams.delete('page');
                router.push(`/categories/${normalizedSlug}?${newParams.toString()}`);
              }
            }}
            className="flex-1"
          />
          <Input
            type="number"
            placeholder="Минимална цена"
            defaultValue={minPrice || ''}
            onChange={(e) => {
              const newParams = new URLSearchParams(searchParams);
              if (e.target.value) {
                newParams.set('minPrice', e.target.value);
              } else {
                newParams.delete('minPrice');
              }
              newParams.delete('page');
              router.push(`/categories/${normalizedSlug}?${newParams.toString()}`);
            }}
            className="w-32"
          />
          <Input
            type="number"
            placeholder="Максимална цена"
            defaultValue={maxPrice || ''}
            onChange={(e) => {
              const newParams = new URLSearchParams(searchParams);
              if (e.target.value) {
                newParams.set('maxPrice', e.target.value);
              } else {
                newParams.delete('maxPrice');
              }
              newParams.delete('page');
              router.push(`/categories/${normalizedSlug}?${newParams.toString()}`);
            }}
            className="w-32"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center">
          <p className="text-slate-400">Вчитување...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-slate-400">Нема производи кои одговараат на вашите критериуми</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => {
              const primaryImage = product.images?.[0] || product.image_url || undefined;
              return (
                <Link key={product.id} href={`/products/${product.id}?category=${encodeURIComponent(normalizedSlug)}`}>
                  <AdCard
                    ad={{
                      id: product.id,
                      title: product.title,
                      price: product.price,
                      currency: product.currency || '€',
                      image_url: primaryImage,
                      location: product.city || product.location || 'Македонија',
                      description: product.description,
                      postedAt: product.created_at,
                      isVerified: Number(product.seller_rating || 0) >= 4.7,
                      badge: null,
                      sold_at: product.sold_at,
                    }}
                  />
                </Link>
              );
            })}
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="whitespace-nowrap">Прикажи:</span>
                {[30, 50, 70, 100].map(n => (
                  <button
                    key={n}
                    onClick={() => { setPerPage(n); goToPage(1); }}
                    className={`rounded border px-1.5 py-0.5 transition ${
                      perPage === n
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
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="rounded border border-[#2a3f55] bg-[#0b1727] px-2.5 py-1 text-xs text-slate-300 hover:bg-[#1d2c43] disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  « Претходна
                </button>
                {totalPages > 1 && (() => {
                  const PAGE_BOXES = 5;
                  let start = Math.max(1, currentPage - 2);
                  if (start + PAGE_BOXES - 1 > totalPages) start = Math.max(1, totalPages - PAGE_BOXES + 1);
                  const boxes: number[] = [];
                  for (let i = start; i < start + PAGE_BOXES && i <= totalPages; i++) boxes.push(i);
                  return boxes.map(p => (
                    <button
                      key={p}
                      onClick={() => goToPage(p)}
                      className={`min-w-[32px] rounded border px-2 py-1 text-xs transition ${
                        currentPage === p
                          ? 'border-red-500/50 bg-red-600/20 text-red-300 font-semibold'
                          : 'border-[#2a3f55] bg-[#0b1727] text-slate-300 hover:bg-[#1d2c43]'
                      }`}
                    >
                      {p}
                    </button>
                  ));
                })()}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="rounded border border-[#2a3f55] bg-[#0b1727] px-2.5 py-1 text-xs text-slate-300 hover:bg-[#1d2c43] disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  Следна страна »
                </button>
              </div>
              <div className="text-xs text-slate-500">{totalProducts.toLocaleString('mk-MK')} вкупно</div>
            </div>
          </div>
        </>
      )}
    </Container>
  );
}

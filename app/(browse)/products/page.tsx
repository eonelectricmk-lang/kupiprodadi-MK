'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AdCard from '@/app/components/AdCard';
import { Button, Container } from '@/app/components/ui';
import { normalizeCategorySlug } from '@/lib/category-aliases';

interface Product {
  id: number;
  title: string;
  price: number;
  currency?: string;
  description: string;
  category: string;
  subcategory?: string | null;
  condition?: string | null;
  location?: string | null;
  city?: string | null;
  image_url?: string | null;
  images?: string[];
  seller_rating?: number;
  created_at?: string;
}

const ITEMS_PER_PAGE = 12;

function formatPostedAt(value?: string) {
  if (!value) return 'Денес';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Денес';

  return new Intl.DateTimeFormat('mk-MK', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const location = searchParams.get('location');
  const page = searchParams.get('page');
  const sub = searchParams.get('sub');
  const trail = searchParams.get('trail');

  useEffect(() => {
    const pageNumber = Math.max(parseInt(page || '1', 10) || 1, 1);
    const controller = new AbortController();

    async function fetchProducts() {
      setLoading(true);
      setError(null);

      try {
        const apiParams = new URLSearchParams();
        apiParams.set('limit', String(ITEMS_PER_PAGE));
        apiParams.set('offset', String((pageNumber - 1) * ITEMS_PER_PAGE));

        if (category) apiParams.set('category', normalizeCategorySlug(category));
        if (sub) apiParams.set('sub', normalizeCategorySlug(sub));
        if (search) apiParams.set('search', search);
        if (location) apiParams.set('location', location);

        const response = await fetch(`/api/products?${apiParams.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Не можам да ги вчитам огласите.');
        }

        const data = await response.json();
        const nextProducts = Array.isArray(data.products) ? data.products : [];
        const total = Number(data.total || 0);

        setProducts(nextProducts);
        setTotalProducts(total);
        setTotalPages(Math.max(Math.ceil(total / ITEMS_PER_PAGE), 1));
        setCurrentPage(pageNumber);
      } catch (fetchError) {
        if ((fetchError as Error).name !== 'AbortError') {
          console.error('Error fetching products:', fetchError);
          setError(fetchError instanceof Error ? fetchError.message : 'Грешка при вчитување на огласи.');
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
  }, [category, search, location, page, sub, trail]);

  const goToPage = (newPage: number) => {
    const nextPage = Math.min(Math.max(newPage, 1), totalPages);
    const newParams = new URLSearchParams(searchParams);

    if (nextPage === 1) {
      newParams.delete('page');
    } else {
      newParams.set('page', nextPage.toString());
    }

    router.push(`/products?${newParams.toString()}`);
  };

  return (
    <Container className="py-8 text-white">
      <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Огласи</h1>
          <p className="mt-1 text-sm text-slate-400">
            {loading ? 'Вчитување...' : `${totalProducts.toLocaleString('mk-MK')} активни огласи`}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="rounded-lg border border-[#1d2c43] bg-[#081223] py-12 text-center">
          <p className="text-slate-400">Вчитување огласи...</p>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-500/35 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-lg border border-[#1d2c43] bg-[#081223] py-12 text-center">
          <p className="text-slate-300">Нема огласи кои одговараат на вашите критериуми.</p>
          <Link href="/sell" className="mt-4 inline-flex rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700">
            Објави прв оглас
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => {
              const primaryImage = product.images?.[0] || product.image_url || undefined;
              const hrefCategory = normalizeCategorySlug(category || product.category);

              return (
                <Link key={product.id} href={`/products/${product.id}?category=${encodeURIComponent(hrefCategory)}`}>
                  <AdCard
                    ad={{
                      id: product.id,
                      title: product.title,
                      price: product.price,
                      currency: product.currency || '€',
                      image_url: primaryImage,
                      location: product.location || product.city || 'Македонија',
                      description: product.description,
                      postedAt: formatPostedAt(product.created_at),
                      isVerified: Number(product.seller_rating || 0) >= 4.7,
                      badge: product.condition === 'Ново' ? 'НОВО' : null,
                    }}
                  />
                </Link>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-12 flex justify-center gap-2">
              <Button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="disabled:cursor-not-allowed disabled:opacity-50"
              >
                ← Назад
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => goToPage(num)}
                  className={`rounded-lg border px-4 py-2 ${
                    currentPage === num
                      ? 'border-red-600 bg-red-600 text-white'
                      : 'border-[#2a3f60] bg-[#122038] text-slate-200 hover:bg-[#1a2d49]'
                  }`}
                >
                  {num}
                </button>
              ))}

              <Button
                type="button"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="disabled:cursor-not-allowed disabled:opacity-50"
              >
                Напред →
              </Button>
            </div>
          )}
        </>
      )}
    </Container>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<Container className="py-8 text-white"><p className="text-slate-400">Вчитување...</p></Container>}>
      <ProductsPageContent />
    </Suspense>
  );
}

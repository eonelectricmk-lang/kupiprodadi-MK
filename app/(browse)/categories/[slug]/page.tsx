'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import AdCard from '@/app/components/AdCard';
import { Container, Input, Button } from '@/app/components/ui';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';
import { X } from 'lucide-react';

interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image_url?: string;
  seller_name?: string;
}

const ITEMS_PER_PAGE = 12;

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const slug = params.slug as string;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categoryName, setCategoryName] = useState('');

  const search = searchParams.get('search');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const page = searchParams.get('page');

  useEffect(() => {
    // Најди го називот на категоријата
    const findCategoryName = () => {
      for (const cat of CATEGORIES) {
        const found = cat.subcategories.find(sub => sub.slug === slug);
        if (found) {
          setCategoryName(found.name);
          return;
        }
      }
      // Ако не е пронајдена, користи slug како назив
      const capitalizedSlug = slug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      setCategoryName(capitalizedSlug);
    };

    findCategoryName();
    setCurrentPage(page ? parseInt(page) : 1);
    fetchProducts();
  }, [slug, search, minPrice, maxPrice, page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Mock data - замени со вистински API call
      const mockData: Product[] = [
        // Мобилни
        { id: 1, title: 'iPhone 13 Pro', price: 450, description: 'Одлично сочуван', category: 'mobilni', seller_name: 'Марко М.' },
        { id: 2, title: 'Samsung Galaxy S24', price: 800, description: 'Нов', category: 'mobilni', seller_name: 'Нина Н.' },
        { id: 3, title: 'Google Pixel 8', price: 700, description: 'Црна', category: 'mobilni', seller_name: 'Борис Б.' },
        
        // Компјутери
        { id: 4, title: 'MacBook Pro 14"', price: 950, description: 'М3 Max, нов', category: 'kompjuteri', seller_name: 'Петар В.' },
        { id: 5, title: 'Dell XPS 15', price: 1200, description: 'Нов лаптоп', category: 'kompjuteri', seller_name: 'Деспина D.' },
        { id: 6, title: 'Lenovo ThinkPad', price: 650, description: 'За работа', category: 'kompjuteri', seller_name: 'Ленче L.' },
        
        // Таблети
        { id: 7, title: 'iPad Air', price: 600, description: 'Фиолетова боја', category: 'tableti', seller_name: 'Џејсон J.' },
        { id: 8, title: 'Samsung Tab S9', price: 550, description: 'Сребрена', category: 'tableti', seller_name: 'Кристина К.' },
        
        // Слушалки
        { id: 9, title: 'AirPods Pro', price: 120, description: 'Оригинални', category: 'slusalki', seller_name: 'Сара С.' },
        { id: 10, title: 'Sony WH-1000XM5', price: 250, description: 'Noise cancelling', category: 'slusalki', seller_name: 'Јас Ј.' },
        
        // Станови
        { id: 11, title: 'Станов во град', price: 80000, description: '50 м2, центар', category: 'stanovi', seller_name: 'Влада Х.' },
        { id: 12, title: 'Модерен станов', price: 120000, description: '80 м2, нов', category: 'stanovi', seller_name: 'Марина М.' },
        { id: 13, title: 'Луксузен станов', price: 200000, description: '150 м2, тераса', category: 'stanovi', seller_name: 'Петар П.' },
        
        // Куќи
        { id: 14, title: 'Куќа во село', price: 35000, description: '100 м2, земја 500 м2', category: 'kuki', seller_name: 'Наташа Н.' },
        { id: 15, title: 'Вила со базен', price: 150000, description: '200м2, 4 спални', category: 'kuki', seller_name: 'Лука Л.' },
        
        // Земја
        { id: 16, title: 'Земјиште 1000м²', price: 25000, description: 'На пат, добра локација', category: 'zemja', seller_name: 'Бобан Б.' },
        { id: 17, title: 'Земјиште 5000м²', price: 80000, description: 'За развој', category: 'zemja', seller_name: 'Јон Ј.' },
        
        // Гаражи
        { id: 18, title: 'Гаража во центар', price: 15000, description: 'Затворена гаража', category: 'garazi', seller_name: 'Марина К.' },
        { id: 19, title: 'Двојна гаража', price: 25000, description: 'За 2 автомобили', category: 'garazi', seller_name: 'Симо С.' },
        
        // Куќни апарати
        { id: 20, title: 'Микробран', price: 120, description: 'Нов, 800W', category: 'kujnski', seller_name: 'Ристо Р.' },
        { id: 21, title: 'Пекарска фурна', price: 200, description: 'Електрична', category: 'kujnski', seller_name: 'Лилјана Л.' },
        
        // Мебел - софи
        { id: 22, title: 'Кожен кауч', price: 200, description: 'За дневна соба', category: 'sofi', seller_name: 'Марина Ј.' },
        { id: 23, title: 'Трослатур кауч', price: 350, description: 'Сив, модерен', category: 'sofi', seller_name: 'Алекса А.' },
        
        // Мебел - маси
        { id: 24, title: 'Маса од дубови', price: 150, description: 'За кујна', category: 'masi', seller_name: 'Јован Ј.' },
        { id: 25, title: 'Дневна маса', price: 100, description: 'Стакло и метал', category: 'masi', seller_name: 'Ева Е.' },
        
        // Облека - машка
        { id: 26, title: 'Машки пердав', price: 60, description: 'Кожа, црн', category: 'muska-obleka', seller_name: 'Јован Ј.' },
        { id: 27, title: 'Машко палто', price: 80, description: 'Зимско', category: 'muska-obleka', seller_name: 'Марко М.' },
        
        // Облека - женска
        { id: 28, title: 'Женска чанта', price: 45, description: 'Кожа, црвена', category: 'zenska-obleka', seller_name: 'Емилија Е.' },
        { id: 29, title: 'Дневна фустан', price: 50, description: 'Модерна', category: 'zenska-obleka', seller_name: 'Соња С.' },
      ];

      // Филтрирање по категорија
      let filtered = mockData.filter(p => p.category === slug);

      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(p =>
          p.title.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
        );
      }
      if (minPrice) {
        filtered = filtered.filter(p => p.price >= parseInt(minPrice));
      }
      if (maxPrice) {
        filtered = filtered.filter(p => p.price <= parseInt(maxPrice));
      }

      // Пагинација
      const total = filtered.length;
      setTotalPages(Math.ceil(total / ITEMS_PER_PAGE));
      
      const startIndex = ((currentPage || 1) - 1) * ITEMS_PER_PAGE;
      const paginatedProducts = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

      setProducts(paginatedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFilter = (filterType: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete(filterType);
    newParams.delete('page');
    router.push(`/categories/${slug}?${newParams.toString()}`);
  };

  const goToPage = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    if (newPage === 1) {
      newParams.delete('page');
    } else {
      newParams.set('page', newPage.toString());
    }
    router.push(`/categories/${slug}?${newParams.toString()}`);
  };

  return (
    <Container className="py-8 text-white">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4 text-white">{categoryName}</h1>

        {/* Active Filters */}
        {(search || minPrice || maxPrice) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {search && (
              <div className="flex items-center gap-2 rounded-full border border-[#2a3f60] bg-[#122038] px-3 py-1 text-sm text-slate-200">
                <span>Пребарување: {search}</span>
                <button
                  onClick={() => removeFilter('search')}
                  className="text-slate-400 hover:text-white"
                  aria-label="Отстрани пребарување"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            {minPrice && (
              <div className="flex items-center gap-2 rounded-full border border-[#2a3f60] bg-[#122038] px-3 py-1 text-sm text-slate-200">
                <span>От {minPrice} ден.</span>
                <button
                  onClick={() => removeFilter('minPrice')}
                  className="text-slate-400 hover:text-white"
                  aria-label="Отстрани минимална цена"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            {maxPrice && (
              <div className="flex items-center gap-2 rounded-full border border-[#2a3f60] bg-[#122038] px-3 py-1 text-sm text-slate-200">
                <span>До {maxPrice} ден.</span>
                <button
                  onClick={() => removeFilter('maxPrice')}
                  className="text-slate-400 hover:text-white"
                  aria-label="Отстрани максимална цена"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Filter Inputs */}
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
                router.push(`/categories/${slug}?${newParams.toString()}`);
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
              router.push(`/categories/${slug}?${newParams.toString()}`);
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
              router.push(`/categories/${slug}?${newParams.toString()}`);
            }}
            className="w-32"
          />
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-slate-400">Вчитување...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400">Нема производи кои одговараат на вашите критериуми</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <Link key={product.id} href={`/products/${product.id}?category=${encodeURIComponent(slug)}`}>
                <AdCard
                  ad={{
                    id: product.id,
                    title: product.title,
                    price: product.price,
                    image_url: product.image_url,
                    location: 'Македонија',
                    isVerified: false,
                  }}
                />
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-12">
              <Button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Назад
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => goToPage(num)}
                  className={`px-4 py-2 rounded-lg border ${
                    currentPage === num
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-[#122038] border-[#2a3f60] text-slate-200 hover:bg-[#1a2d49]'
                  }`}
                >
                  {num}
                </button>
              ))}

              <Button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="disabled:opacity-50 disabled:cursor-not-allowed"
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

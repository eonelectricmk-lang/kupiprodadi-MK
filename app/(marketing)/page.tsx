'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MessageCircle, ShieldCheck, Zap } from 'lucide-react';
import Header from '../components/Header';
import AdCard from '../components/AdCard';
import { Container, Input, Button } from '../components/ui';
import { CATEGORIES } from '@/lib/categories';

const FEATURED_ADS = [
  { id: 1, title: 'iPhone 15 Pro Max', price: 1200, currency: '€', seller_name: 'Марко М.', location: 'Скопје', image_url: 'https://picsum.photos/300/300?random=1', verified: true },
  { id: 2, title: 'Trek Domane AL', price: 850, currency: '€', seller_name: 'Ана П.', location: 'Битола', image_url: 'https://picsum.photos/300/300?random=2', verified: false },
  { id: 3, title: 'MacBook Pro 16"', price: 2400, currency: '€', seller_name: 'Иван К.', location: 'Охрид', image_url: 'https://picsum.photos/300/300?random=3', verified: true },
  { id: 4, title: 'Стан 80м² во центар', price: 180000, currency: '€', seller_name: 'Петар В.', location: 'Прилеп', image_url: 'https://picsum.photos/300/300?random=4', verified: true },
  { id: 5, title: 'BMW 330d', price: 18500, currency: '€', seller_name: 'Марина Ј.', location: 'Куманово', image_url: 'https://picsum.photos/300/300?random=5', verified: true },
  { id: 6, title: 'Дизајнерски кауч', price: 650, currency: '€', seller_name: 'Алекса Г.', location: 'Велес', image_url: 'https://picsum.photos/300/300?random=6', verified: false },
  { id: 7, title: 'Во позади светли', price: 280, currency: '€', seller_name: 'Марко М.', location: 'Скопје', image_url: 'https://picsum.photos/300/300?random=7', verified: true },
  { id: 8, title: 'Куќа со градина', price: 250000, currency: '€', seller_name: 'Ана П.', location: 'Охрид', image_url: 'https://picsum.photos/300/300?random=8', verified: false },
];

export default function Home() {
  return (
    <main className="bg-white min-h-screen">
      {/* Hero Banner - Full Image with Overlay */}
      <section className="bg-white py-2">
        <Container>
          <div 
            className="relative h-56 bg-cover bg-center flex items-center rounded-xl overflow-hidden"
            style={{
              backgroundImage: `url('https://picsum.photos/1920/500?random=999')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/40"></div>
            
            <div className="relative z-10 space-y-4 max-w-2xl px-8">
              <h2 className="text-4xl font-bold text-white leading-tight">
                Безбеден Пазар за Сите
              </h2>
              <div className="flex gap-6 text-white text-sm font-bold">
                <span className="flex items-center gap-2">
                  <span className="text-lg">✓</span> Верифицирани Продавачи
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-lg">✓</span> Безбедна Доставка
                </span>
              </div>
              <div>
                <Link href="/products">
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 text-base">
                    Откријте Огласи →
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Popular Listings */}
      <section className="py-3 bg-white">
        <Container>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-2xl font-bold text-gray-900">Популарни Огласи</h2>
            <Link href="/products" className="text-blue-900 hover:text-blue-800 font-semibold">Сите огласи →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {FEATURED_ADS.map((ad) => (
              <Link key={ad.id} href={`/products/${ad.id}`}>
                <div className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition cursor-pointer group relative">
                  {/* Badge */}
                  {ad.verified && (
                    <div className="absolute top-2 left-2 bg-yellow-400 text-gray-900 px-2 py-1 rounded text-xs font-bold z-10">
                      ✓ Верифицирано
                    </div>
                  )}
                  
                  {/* Image */}
                  <div className="relative h-40 bg-gray-200 overflow-hidden">
                    <img 
                      src={ad.image_url} 
                      alt={ad.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                  </div>
                  
                  {/* Info */}
                  <div className="p-3">
                    <p className="text-xs text-gray-500 mb-1">{ad.location}</p>
                    <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">{ad.title}</h3>
                    <div className="flex justify-between items-end">
                      <p className="text-lg font-bold text-red-500 drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]">{ad.price} {ad.currency}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Info Section */}
      <section className="bg-gray-50 py-12 border-t border-gray-200">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mb-4 inline-flex rounded-full bg-slate-100 p-3 text-slate-700">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Безбедна Трансакција</h3>
              <p className="text-gray-600">Верифицирани продавачи и защита на купувачите</p>
            </div>
            <div className="text-center">
              <div className="mb-4 inline-flex rounded-full bg-slate-100 p-3 text-slate-700">
                <Zap className="h-7 w-7" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Брзо и Едноставно</h3>
              <p className="text-gray-600">Постави огласи за неколку минути</p>
            </div>
            <div className="text-center">
              <div className="mb-4 inline-flex rounded-full bg-slate-100 p-3 text-slate-700">
                <MessageCircle className="h-7 w-7" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Директна Комуникација</h3>
              <p className="text-gray-600">Кажи контакт директно со купувачи/продавачи</p>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}

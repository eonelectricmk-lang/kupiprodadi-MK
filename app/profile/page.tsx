'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/app/components/Header';
import { Container } from '@/app/components/ui/Container';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { AdCard } from '@/app/components/AdCard';
import { Star, UserCircle } from 'lucide-react';

interface Product {
  id: number;
  title: string;
  price: number;
  currency: string;
  location: string;
  category: string;
  seller_name: string;
  image_url: string;
}

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  sender_name: string;
  receiver_name: string;
  content: string;
  product_title: string;
  read: boolean;
  created_at: string;
}

interface Review {
  id: number;
  from_user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState('ads');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (!userData.id) {
      window.location.href = '/auth';
      return;
    }
    setUser(userData);

    // Fetch user's products
    fetch(`/api/products?seller_id=${userData.id}`)
      .then(res => res.json())
      .then(data => setMyProducts(data.products || []))
      .catch(err => console.error(err));

    // Fetch favorites
    fetch(`/api/favorites?user_id=${userData.id}`)
      .then(res => res.json())
      .then(data => setFavorites(data || []))
      .catch(err => console.error(err));

    // Fetch messages
    fetch(`/api/messages?user_id=${userData.id}`)
      .then(res => res.json())
      .then(data => setMessages(data || []))
      .catch(err => console.error(err));

    // Fetch reviews
    fetch(`/api/reviews?to_user_id=${userData.id}`)
      .then(res => res.json())
      .then(data => setReviews(data.reviews || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !user) {
    return <div className="text-center py-20">Вчитување...</div>;
  }

  const unreadMessages = messages.filter(m => !m.read && m.receiver_id === user.id).length;

  return (
    <div className="bg-slate-900 min-h-screen">
      <Header />
      <Container>
        <div className="py-8">
          {/* User Header */}
          <Card className="p-6 mb-8">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
                  <UserCircle className="h-12 w-12 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{user.name}</h1>
                  <p className="text-slate-400">{user.email}</p>
                  <p className="text-sm text-slate-500">{user.phone}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{user.rating || 5.0}/5.0</span>
                  </div>
                </div>
              </div>
              <Button>Преуреди профил</Button>
            </div>
          </Card>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-slate-700 overflow-x-auto">
            <button
              onClick={() => setActiveTab('ads')}
              className={`pb-4 px-4 font-semibold transition whitespace-nowrap ${
                activeTab === 'ads'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Мои огласи ({myProducts.length})
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`pb-4 px-4 font-semibold transition whitespace-nowrap ${
                activeTab === 'favorites'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Сачувани ({favorites.length})
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`pb-4 px-4 font-semibold transition relative whitespace-nowrap ${
                activeTab === 'messages'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Пораки ({messages.length})
              {unreadMessages > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-xs text-white rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadMessages}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-4 px-4 font-semibold transition whitespace-nowrap ${
                activeTab === 'reviews'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Рецензии ({reviews.length})
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'ads' && (
            <div>
              {myProducts.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-slate-400 mb-4">Немаш огласи за сега</p>
                  <Button onClick={() => window.location.href = '/sell'}>
                    Постави нов огласи
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {myProducts.map(product => (
                    <AdCard
                      key={product.id}
                      ad={{
                        id: product.id,
                        title: product.title,
                        price: product.price,
                        currency: product.currency,
                        location: product.location,
                        image_url: product.image_url,
                        isVerified: false,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div>
              {favorites.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-slate-400">Немаш сачувани огласи</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {favorites.map(product => (
                    <AdCard
                      key={product.id}
                      ad={{
                        id: product.id,
                        title: product.title,
                        price: product.price,
                        currency: product.currency,
                        location: product.location,
                        image_url: product.image_url,
                        isVerified: false,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'messages' && (
            <div>
              {messages.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-slate-400">Немаш пораки</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {messages.map(msg => (
                    <Card key={msg.id} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">
                            {msg.sender_id === user.id ? msg.receiver_name : msg.sender_name}
                          </p>
                          <p className="text-sm text-slate-400">{msg.product_title}</p>
                        </div>
                        {!msg.read && <span className="bg-blue-600 w-2 h-2 rounded-full"></span>}
                      </div>
                      <p className="text-slate-300 mb-2">{msg.content}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(msg.created_at).toLocaleDateString('mk-MK')}
                      </p>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              {reviews.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-slate-400">Немаш рецензии за сега</p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {reviews.map(review => (
                    <Card key={review.id} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold">{review.from_user_name}</p>
                        <span className="flex items-center gap-0.5 text-yellow-400">
                          {Array.from({ length: Math.max(1, Math.round(review.rating)) }, (_, i) => (
                            <Star key={`${review.id}-star-${i}`} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                          ))}
                        </span>
                      </div>
                      <p className="text-slate-300 mb-2">{review.comment}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(review.created_at).toLocaleDateString('mk-MK')}
                      </p>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Header from '../components/Header';
import { Button, Input, Container, Card } from '../components/ui';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    alert(isLogin ? 'Успешна најава!' : 'Успешна регистрација!');
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[var(--bg)] flex items-center py-8">
        <Container>
          <div className="max-w-md mx-auto">
            <Card>
              <h1 className="text-3xl font-bold mb-6 text-center text-black dark:text-white">
                {isLogin ? 'Најави се' : 'Регистрирај се'}
              </h1>

              <form onSubmit={handleAuth} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-black dark:text-white">
                      Име
                    </label>
                    <Input
                      type="text"
                      required
                      placeholder="Твое име"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold mb-2 text-black dark:text-white">
                    Е-пошта
                  </label>
                  <Input
                    type="email"
                    required
                    placeholder="твоја@пошта.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-black dark:text-white">
                    Лозинка
                  </label>
                  <Input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <Button variant="primary" className="w-full">
                  {isLogin ? 'Најава' : 'Регистрација'}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                <span className="text-[var(--muted)]">
                  {isLogin ? 'Немаш сметка? ' : 'Веќе имаш сметка? '}
                </span>
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-semibold text-black dark:text-white hover:underline"
                >
                  {isLogin ? 'Регистрирај се' : 'Најави се'}
                </button>
              </div>
            </Card>
          </div>
        </Container>
      </main>
    </>
  );
}

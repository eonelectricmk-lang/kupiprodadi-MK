'use client';

import { useState } from 'react';
import { Button, Input } from './ui';

type AuthType = 'login' | 'register';

export default function AuthForm({ type }: { type: AuthType }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = type === 'login' ? '/api/auth/login' : '/api/auth/register';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Грешка при обработка.');
        return;
      }

      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/profile';
    } catch {
      setError('Грешка при конекција.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-white">Е-пошта</label>
        <Input
          type="email"
          name="email"
          placeholder="твоја@пошта.com"
          value={formData.email}
          onChange={handleChange}
          required
          className="!border-[#223653] !bg-[#081223] !text-white placeholder:!text-slate-500 focus:!border-[#2d4f7d] focus:!ring-[#2d4f7d]/30"
        />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-white">Лозинка</label>
        <Input
          type="password"
          name="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          required
          className="!border-[#223653] !bg-[#081223] !text-white placeholder:!text-slate-500 focus:!border-[#2d4f7d] focus:!ring-[#2d4f7d]/30"
        />
      </div>

      {type === 'register' && (
        <>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-white">Име</label>
            <Input
              type="text"
              name="name"
              placeholder="Твоето име"
              value={formData.name}
              onChange={handleChange}
              required
              className="!border-[#223653] !bg-[#081223] !text-white placeholder:!text-slate-500 focus:!border-[#2d4f7d] focus:!ring-[#2d4f7d]/30"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-white">Телефон</label>
            <Input
              type="tel"
              name="phone"
              placeholder="08x xxx xxx"
              value={formData.phone}
              onChange={handleChange}
              className="!border-[#223653] !bg-[#081223] !text-white placeholder:!text-slate-500 focus:!border-[#2d4f7d] focus:!ring-[#2d4f7d]/30"
            />
          </div>
        </>
      )}

      <Button
        variant="primary"
        type="submit"
        className="w-full rounded-xl bg-red-600 py-3 text-sm font-bold text-white hover:bg-red-700"
        disabled={loading}
      >
        {loading ? 'Се учитува...' : type === 'login' ? 'Најави се' : 'Регистрирај се'}
      </Button>
    </form>
  );
}

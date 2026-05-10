'use client';

import { useState } from 'react';

export default function AuthForm({ type }: { type: 'login' | 'register' }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = type === 'login' 
        ? '/api/auth/login' 
        : '/api/auth/register';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Грешка');
      } else {
        // Store user data (you might want to use proper session management)
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/products';
      }
    } catch (err) {
      setError('Грешка при конекција');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}

      <input
        type="email"
        name="email"
        placeholder="Е-пошта"
        value={formData.email}
        onChange={handleChange}
        required
        className="w-full px-4 py-2 border rounded"
      />

      <input
        type="password"
        name="password"
        placeholder="Лозинка"
        value={formData.password}
        onChange={handleChange}
        required
        className="w-full px-4 py-2 border rounded"
      />

      {type === 'register' && (
        <>
          <input
            type="text"
            name="name"
            placeholder="Име"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded"
          />

          <input
            type="tel"
            name="phone"
            placeholder="Телефон"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
          />
        </>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Се учитува...' : (type === 'login' ? 'Логирај се' : 'Регистрирај се')}
      </button>
    </form>
  );
}

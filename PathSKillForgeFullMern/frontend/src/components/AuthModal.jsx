import React, { useState } from 'react';
import API from '../api';

export default function AuthModal({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const endpoint = isRegister ? '/auth/signup' : '/auth/login';
      const res = await API.post(endpoint, formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      onLoginSuccess(res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl mx-auto flex items-center justify-center font-bold text-xl mb-3 shadow-lg shadow-indigo-600/30">
            P
          </div>
          <h2 className="text-2xl font-bold text-slate-800">
            {isRegister ? 'Create Your Account' : 'Welcome to PathSkillForge'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">Your personal AI study mentor</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="John Doe"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-sm transition shadow-md shadow-indigo-600/20"
          >
            {isRegister ? 'Sign Up' : 'Log In'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-indigo-600 font-semibold hover:underline"
          >
            {isRegister ? 'Log In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
}
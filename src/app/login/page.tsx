'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, Mail } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await login(email, password);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--background)]" style={{ background: 'radial-gradient(circle at 50% 30%, rgba(212,175,55,0.07), transparent 60%), var(--background)' }}>
            <div className="glass p-8 rounded-xl shadow-2xl w-96 border border-[var(--border)] relative overflow-hidden animate-fade-in">
                <div className="absolute top-0 left-0 w-full h-1 gold-underline" style={{ background: 'linear-gradient(90deg, var(--primary), transparent)' }}></div>
                <h1 className="text-3xl font-bold mb-8 text-center gold-gradient tracking-tight">Login</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-[var(--muted)] mb-1">Email</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-[var(--muted)]" />
                            </div>
                            <input
                                type="email"
                                required
                                className="input-glow block w-full pl-10 sm:text-sm border border-[var(--border)] bg-[var(--surface-highlight)] rounded-lg p-2.5 text-[var(--foreground)] placeholder-[var(--muted)] font-medium transition-all"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--muted)] mb-1">Senha</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-[var(--muted)]" />
                            </div>
                            <input
                                type="password"
                                required
                                className="input-glow block w-full pl-10 sm:text-sm border border-[var(--border)] bg-[var(--surface-highlight)] rounded-lg p-2.5 text-[var(--foreground)] placeholder-[var(--muted)] font-medium transition-all"
                                placeholder="********"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2.5 px-4 rounded-lg text-sm cursor-pointer disabled:opacity-50 font-bold"
                        style={{ background: 'linear-gradient(145deg, #92700C 0%, #BF9B30 15%, #DBCA6E 35%, #FFEC8A 50%, #DBCA6E 65%, #BF9B30 85%, #92700C 100%)', color: '#1A1200', border: '1px solid rgba(255,236,138,0.3)', boxShadow: '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,250,220,0.4), inset 0 -1px 0 rgba(146,112,12,0.3)', textShadow: '0 1px 0 rgba(255,250,220,0.3)' }}
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
                <div className="mt-4 text-xs text-center text-[var(--primary)] opacity-70 space-y-2">

                    <p>
                        <a href="/register" className="text-[var(--primary)] hover:text-[var(--primary-hover)] font-medium text-sm hover:underline transition-colors">
                            Criar nova conta
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

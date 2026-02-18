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
        <div className="min-h-screen flex items-center justify-center bg-[#121212]">
            <div className="bg-[#1E1E1E] p-8 rounded-lg shadow-md w-96 border border-[#333]">
                <h1 className="text-2xl font-bold mb-6 text-center neon-text">Login</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-[#FFE600] mb-1">Email</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-[#FFE600] opacity-70" />
                            </div>
                            <input
                                type="email"
                                required
                                className="focus:ring-[#FFE600] focus:border-[#FFE600] block w-full pl-10 sm:text-sm border-[#333] bg-[#121212] rounded-md p-2 border text-[#FFE600] placeholder-yellow-900/50 font-medium"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-[#FFE600] mb-1">Senha</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-[#FFE600] opacity-70" />
                            </div>
                            <input
                                type="password"
                                required
                                className="focus:ring-[#FFE600] focus:border-[#FFE600] block w-full pl-10 sm:text-sm border-[#333] bg-[#121212] rounded-md p-2 border text-[#FFE600] placeholder-yellow-900/50 font-medium"
                                placeholder="********"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-[#FFE600] rounded-md shadow-sm text-sm font-medium text-[#FFE600] bg-yellow-600/20 hover:bg-yellow-600/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFE600] disabled:opacity-50 transition-colors"
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
                <div className="mt-4 text-xs text-center text-[#FFE600] opacity-70 space-y-2">
                    <p>Teste com: admin@test.com, operador@test.com</p>
                    <p>
                        <a href="/register" className="text-[#FFE600] hover:text-[#FFE600] font-bold underline decoration-yellow-600/50 hover:decoration-[#FFE600]">
                            Criar nova conta
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

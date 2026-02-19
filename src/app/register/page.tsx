'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { Lock, Mail, UserPlus, ArrowLeft, Shield } from 'lucide-react';
import Link from 'next/link';
import MD5 from 'crypto-js/md5';
import { Role } from '@/types';
import { useToast } from '@/contexts/ToastContext';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<Role>('vendedor');
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const passwordHash = MD5(password).toString();
            // Pass name, email, passwordHash, role
            const result = await authService.register(name, email, passwordHash, role);

            if (result.success) {
                showToast('Cadastro realizado com sucesso! Faça login para continuar.', 'success');
                router.push('/login');
            } else {
                showToast(`Erro ao realizar cadastro: ${result.message}`, 'error');
            }
        } catch (error) {
            console.error('Registration failed', error);
            showToast('Erro inesperado ao realizar cadastro.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
            <div className="bg-[var(--surface)] p-8 rounded-xl shadow-2xl w-96 border border-[var(--border)] premium-card">
                <div className="flex justify-center mb-6">
                    <UserPlus className="h-12 w-12 text-[var(--primary)]" />
                </div>
                <h1 className="text-2xl font-bold mb-6 text-center tracking-tight" style={{ background: 'linear-gradient(135deg, #BF953F 0%, #FCF6BA 25%, #B38728 50%, #FBF5B7 75%, #AA771C 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Criar Conta</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--muted)] mb-2">Nome</label>
                        <div className="mt-1 relative rounded-lg shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <UserPlus className="h-5 w-5 text-[var(--muted)]" />
                            </div>
                            <input
                                type="text"
                                required
                                className="block w-full pl-10 sm:text-sm border-[var(--border)] bg-[var(--surface-highlight)] rounded-lg p-3 border text-[var(--foreground)] placeholder-[var(--muted)] focus:border-[var(--primary)] focus:ring-[var(--primary)] transition-all"
                                placeholder="Seu Nome"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--muted)] mb-2">Email</label>
                        <div className="mt-1 relative rounded-lg shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-[var(--muted)]" />
                            </div>
                            <input
                                type="email"
                                required
                                className="block w-full pl-10 sm:text-sm border-[var(--border)] bg-[var(--surface-highlight)] rounded-lg p-3 border text-[var(--foreground)] placeholder-[var(--muted)] focus:border-[var(--primary)] focus:ring-[var(--primary)] transition-all"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--muted)] mb-2">Senha</label>
                        <div className="mt-1 relative rounded-lg shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-[var(--muted)]" />
                            </div>
                            <input
                                type="password"
                                required
                                className="block w-full pl-10 sm:text-sm border-[var(--border)] bg-[var(--surface-highlight)] rounded-lg p-3 border text-[var(--foreground)] placeholder-[var(--muted)] focus:border-[var(--primary)] focus:ring-[var(--primary)] transition-all"
                                placeholder="********"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--muted)] mb-2">Função</label>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setRole('vendedor' as Role)}
                                className="flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all cursor-pointer"
                                style={role === 'vendedor' ? {
                                    background: 'linear-gradient(145deg, #0A5C1A 0%, #1B8C3A 15%, #3DBF5E 35%, #6EE88A 50%, #3DBF5E 65%, #1B8C3A 85%, #0A5C1A 100%)',
                                    color: '#0A2010',
                                    border: '1px solid rgba(110,232,138,0.4)',
                                    boxShadow: '0 4px 15px rgba(59,191,94,0.35), inset 0 1px 0 rgba(110,232,138,0.4), inset 0 -1px 0 rgba(10,92,26,0.3)',
                                    textShadow: '0 1px 0 rgba(110,232,138,0.3)'
                                } : {
                                    background: 'rgba(59,191,94,0.08)',
                                    color: '#3DBF5E',
                                    border: '1px solid rgba(59,191,94,0.25)'
                                }}
                            >
                                VENDEDOR
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('operador' as Role)}
                                className="flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all cursor-pointer"
                                style={role === 'operador' ? {
                                    background: 'linear-gradient(145deg, #0A3B6C 0%, #1B6BBF 15%, #3D8EDB 35%, #6EB8F0 50%, #3D8EDB 65%, #1B6BBF 85%, #0A3B6C 100%)',
                                    color: '#0A1830',
                                    border: '1px solid rgba(110,184,240,0.4)',
                                    boxShadow: '0 4px 15px rgba(59,142,219,0.35), inset 0 1px 0 rgba(110,184,240,0.4), inset 0 -1px 0 rgba(10,59,108,0.3)',
                                    textShadow: '0 1px 0 rgba(110,184,240,0.3)'
                                } : {
                                    background: 'rgba(59,142,219,0.08)',
                                    color: '#3D8EDB',
                                    border: '1px solid rgba(59,142,219,0.25)'
                                }}
                            >
                                OPERADOR
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-3 px-4 rounded-lg text-sm font-bold disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                        style={{ background: 'linear-gradient(145deg, #92700C 0%, #BF9B30 15%, #DBCA6E 35%, #FFEC8A 50%, #DBCA6E 65%, #BF9B30 85%, #92700C 100%)', color: '#1A1200', border: '1px solid rgba(255,236,138,0.3)', boxShadow: '0 4px 15px rgba(212,175,55,0.3), inset 0 1px 0 rgba(255,250,220,0.4), inset 0 -1px 0 rgba(146,112,12,0.3)', textShadow: '0 1px 0 rgba(255,250,220,0.3)' }}
                    >
                        {loading ? 'Cadastrando...' : 'Cadastrar'}
                    </button>
                </form>
                <div className="mt-6 text-center">
                    <Link href="/login" className="flex items-center justify-center text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
                        <ArrowLeft size={16} className="mr-1" />
                        Voltar para Login
                    </Link>
                </div>
            </div>
        </div>
    );
}

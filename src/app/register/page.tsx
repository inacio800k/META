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
        <div className="min-h-screen flex items-center justify-center bg-[#121212]">
            <div className="bg-[#1E1E1E] p-8 rounded-lg shadow-lg w-96 border border-[#333]">
                <div className="flex justify-center mb-6">
                    <UserPlus className="h-12 w-12 text-[#FFE600]" />
                </div>
                <h1 className="text-2xl font-bold mb-6 text-center text-[#FFE600] neon-text">Criar Conta</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[#FFE600] mb-2">Nome</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <UserPlus className="h-5 w-5 text-[#FFE600] opacity-50" />
                            </div>
                            <input
                                type="text"
                                required
                                className="block w-full pl-10 sm:text-sm border-[#333] bg-[#121212] rounded-md p-3 border text-[#FFE600] placeholder-yellow-900/50 focus:border-[#FFE600] focus:ring-[#FFE600]"
                                placeholder="Seu Nome"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#FFE600] mb-2">Email</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-[#FFE600] opacity-50" />
                            </div>
                            <input
                                type="email"
                                required
                                className="block w-full pl-10 sm:text-sm border-[#333] bg-[#121212] rounded-md p-3 border text-[#FFE600] placeholder-yellow-900/50 focus:border-[#FFE600] focus:ring-[#FFE600]"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#FFE600] mb-2">Senha</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-[#FFE600] opacity-50" />
                            </div>
                            <input
                                type="password"
                                required
                                className="block w-full pl-10 sm:text-sm border-[#333] bg-[#121212] rounded-md p-3 border text-[#FFE600] placeholder-yellow-900/50 focus:border-[#FFE600] focus:ring-[#FFE600]"
                                placeholder="********"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#FFE600] mb-2">Função</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Shield className="h-5 w-5 text-[#FFE600] opacity-50" />
                            </div>
                            <select
                                required
                                className="block w-full pl-10 sm:text-sm border-[#333] bg-[#121212] rounded-md p-3 border text-[#FFE600] placeholder-yellow-900/50 focus:border-[#FFE600] focus:ring-[#FFE600] appearance-none"
                                value={role}
                                onChange={(e) => setRole(e.target.value as Role)}
                            >
                                <option value="vendedor">VENDEDOR</option>
                                <option value="operador">OPERADOR</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <span className="text-[#FFE600] text-xs opacity-50">▼</span>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-3 px-4 border border-[#FFE600] rounded-md shadow-sm text-sm font-bold text-[#FFE600] bg-yellow-600/20 hover:bg-yellow-600/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFE600] disabled:opacity-50 transition p-3"
                    >
                        {loading ? 'Cadastrando...' : 'Cadastrar'}
                    </button>
                </form>
                <div className="mt-6 text-center">
                    <Link href="/login" className="flex items-center justify-center text-sm text-[#FFE600] hover:text-[#FFE600]/80 transition-colors opacity-80 hover:opacity-100">
                        <ArrowLeft size={16} className="mr-1" />
                        Voltar para Login
                    </Link>
                </div>
            </div>
        </div>
    );
}

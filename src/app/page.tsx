'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermission } from '@/hooks/usePermission';
import { Sidebar } from '@/components/layout/Sidebar';
import { useRouter } from 'next/navigation';
import { RegisterNumberModal } from '@/components/RegisterNumberModal';
import { PlusCircle, TrendingUp, Users, Calendar } from 'lucide-react';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { isRole } = usePermission();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[var(--background)]">
        <div className="flex flex-col items-center space-y-4">
          <div className="skeleton h-4 w-48"></div>
          <div className="skeleton h-3 w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-[var(--background)] min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold gold-gradient tracking-tight">Dashboard</h1>
            <p className="text-[var(--muted)] mt-1">Visão geral do sistema e operações.</p>
          </div>
          {(isRole('admin') || isRole('operador')) && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-lg cursor-pointer font-bold animate-gold-pulse"
              style={{ background: 'linear-gradient(145deg, #92700C 0%, #BF9B30 15%, #DBCA6E 35%, #FFEC8A 50%, #DBCA6E 65%, #BF9B30 85%, #92700C 100%)', color: '#1A1200', border: '1px solid rgba(255,236,138,0.3)', boxShadow: '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,250,220,0.4), inset 0 -1px 0 rgba(146,112,12,0.3)', textShadow: '0 1px 0 rgba(255,250,220,0.3)' }}
            >
              <PlusCircle size={20} />
              <span>Registrar Número</span>
            </button>
          )}
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="premium-card p-6 rounded-xl animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[var(--muted)] font-medium text-sm uppercase tracking-wider">Status do Sistema</h3>
              <TrendingUp size={20} className="text-[var(--primary)]" />
            </div>
            <p className="text-2xl font-bold text-[var(--foreground)]">Operacional</p>
            <p className="text-xs text-green-500 mt-2 flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
              Todos os serviços ativos
            </p>
          </div>

          <div className="premium-card p-6 rounded-xl animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[var(--muted)] font-medium text-sm uppercase tracking-wider">Sua Função</h3>
              <Users size={20} className="text-[var(--primary)]" />
            </div>
            <p className="text-2xl font-bold text-[var(--foreground)] capitalize">{user.role}</p>
            <p className="text-xs text-[var(--muted)] mt-2">Permissões de acesso atualizadas</p>
          </div>

          <div className="premium-card p-6 rounded-xl animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[var(--muted)] font-medium text-sm uppercase tracking-wider">Data</h3>
              <Calendar size={20} className="text-[var(--primary)]" />
            </div>
            <p className="text-2xl font-bold text-[var(--foreground)]">
              {new Date().toLocaleDateString('pt-BR')}
            </p>
            <p className="text-xs text-[var(--muted)] mt-2">Semana atual de operações</p>
          </div>
        </div>

        <div className="premium-card rounded-xl p-12 text-center border-dashed border-2 border-[var(--border)] bg-transparent animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--surface-highlight)] mb-4">
            <TrendingUp size={32} className="text-[var(--muted)]" />
          </div>
          <h3 className="text-xl font-medium text-[var(--foreground)] mb-2">Bem-vindo ao Meta Vendedores</h3>
          <p className="text-[var(--muted)] max-w-md mx-auto">
            Selecione uma opção no menu lateral para começar a gerenciar suas vendas, relatórios e sessões.
          </p>
        </div>

        <RegisterNumberModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </main>
    </div>
  );
}

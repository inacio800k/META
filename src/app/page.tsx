'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermission } from '@/hooks/usePermission';
import { Sidebar } from '@/components/layout/Sidebar';
import { useRouter } from 'next/navigation';
import { RegisterNumberModal } from '@/components/RegisterNumberModal';
import { PlusCircle } from 'lucide-react';

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
    return <div className="h-screen w-full flex items-center justify-center bg-gray-900 text-white">Carregando...</div>;
  }

  return (
    <div className="flex bg-[#121212] min-h-screen text-[#FFE600]">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold neon-text">Dashboard</h1>
            <p className="text-[#FFE600] opacity-80">Bem-vindo ao painel de controle</p>
          </div>
          {(isRole('admin') || isRole('operador')) && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 bg-[#1E1E1E] text-[#FFE600] border border-[#FFE600] px-4 py-2 rounded-md hover:bg-[#FFE600] hover:text-black transition-all shadow-[0_0_10px_rgba(255,230,0,0.3)] hover:shadow-[0_0_20px_rgba(255,230,0,0.5)]"
            >
              <PlusCircle size={20} />
              <span>Registrar Número</span>
            </button>
          )}
        </header>

        <div className="bg-[#1E1E1E] rounded-lg shadow-lg border border-[#333] p-12 text-center">
          <p className="text-[#FFE600] opacity-60 text-lg">Selecione uma opção no menu lateral para começar.</p>
        </div>

        <RegisterNumberModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </main>
    </div>
  );
}

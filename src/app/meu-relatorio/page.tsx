'use client';

import React, { useEffect, useState } from 'react';
import { usePermission } from '@/hooks/usePermission';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { dataService } from '@/services/dataService';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import { ExternalLink } from 'lucide-react';

interface ReportItem {
    id_conversa: string;
    num_cliente: string;
    sessao_disparo: string;
    hora_chamado: string;
    hora_visualizou: string;
    hora_respondeu: string;
    nome_atendente: string;
    link_conversa: string;
}

export default function MeuRelatorioPage() {
    const { hasRole, loading: authLoading } = usePermission();
    const router = useRouter();
    const { showToast } = useToast();
    const { user } = useAuth();
    const [reportData, setReportData] = useState<ReportItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !hasRole(['vendedor'])) {
            router.push('/');
        }
    }, [authLoading, hasRole, router]);

    useEffect(() => {
        if (authLoading || !hasRole(['vendedor']) || !user) return;

        const fetchData = async () => {
            try {
                const result = await dataService.getMeuRelatorio(user);

                // Handle different response structures
                let dataArray: ReportItem[] = [];
                if (Array.isArray(result)) {
                    dataArray = result;
                } else if (result && typeof result === 'object') {
                    const possibleArray = Object.values(result).find(val => Array.isArray(val));
                    if (possibleArray) {
                        dataArray = possibleArray as ReportItem[];
                    }
                }

                setReportData(dataArray);
                showToast('Relatório carregado', 'success');
            } catch (error) {
                console.error('Error fetching meu relatorio:', error);
                showToast('Erro ao carregar relatório', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [authLoading, hasRole, showToast, user]);

    if (authLoading || loading) {
        return (
            <div className="flex h-screen bg-[#121212] text-[#FFE600] items-center justify-center">
                <div className="text-xl">Carregando...</div>
            </div>
        );
    }

    if (!hasRole(['vendedor'])) return null;

    return (
        <div className="flex h-screen bg-[#121212] text-[#FFE600] overflow-hidden">
            <Sidebar />
            <main className="flex-1 ml-64 h-full overflow-y-auto p-8 pb-12">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold neon-text">Meu Relatório</h1>
                    <p className="text-[#FFE600] opacity-80">Visualizar meu desempenho</p>
                </header>

                <div className="bg-[#1E1E1E] rounded-lg shadow-lg border border-[#333] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#2a2a2a] border-b border-[#333] text-[#FFE600] uppercase text-xs font-bold tracking-wider">
                                    <th className="p-4">ID Conversa</th>
                                    <th className="p-4">Cliente</th>
                                    <th className="p-4">Sessão</th>
                                    <th className="p-4">Chamado</th>
                                    <th className="p-4">Visualizou</th>
                                    <th className="p-4">Respondeu</th>
                                    <th className="p-4">Atendente</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#333]">
                                {reportData.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-gray-500">
                                            Nenhum registro encontrado.
                                        </td>
                                    </tr>
                                ) : (
                                    reportData.map((item, index) => (
                                        <tr key={index} className="hover:bg-[#252525] transition-colors text-sm">
                                            <td className="p-4">
                                                {item.link_conversa ? (
                                                    <a
                                                        href={item.link_conversa}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="neon-text hover:underline flex items-center gap-1 font-bold"
                                                    >
                                                        {item.id_conversa}
                                                        <ExternalLink size={12} />
                                                    </a>
                                                ) : (
                                                    <span className="neon-text font-bold">{item.id_conversa || '-'}</span>
                                                )}
                                            </td>
                                            <td className="p-4 opacity-90">{item.num_cliente || '-'}</td>
                                            <td className="p-4 opacity-90">{item.sessao_disparo || '-'}</td>
                                            <td className="p-4 opacity-80 font-mono text-xs">{item.hora_chamado ? new Date(item.hora_chamado).toLocaleString('pt-BR') : '-'}</td>
                                            <td className="p-4 opacity-80 font-mono text-xs">{item.hora_visualizou ? new Date(item.hora_visualizou).toLocaleString('pt-BR') : '-'}</td>
                                            <td className="p-4 opacity-80 font-mono text-xs">{item.hora_respondeu ? new Date(item.hora_respondeu).toLocaleString('pt-BR') : '-'}</td>
                                            <td className="p-4 opacity-90">{item.nome_atendente || '-'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}

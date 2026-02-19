'use client';

import React, { useEffect, useState } from 'react';
import { usePermission } from '@/hooks/usePermission';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { dataService } from '@/services/dataService';

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

    const { user } = useAuth();
    const [reportData, setReportData] = useState<ReportItem[]>([]);


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
            } catch (error) {
                console.error('Error fetching meu relatorio:', error);
            }
        };

        fetchData();
    }, [authLoading, hasRole, user]);

    if (authLoading) return null;

    if (!hasRole(['vendedor'])) return null;

    return (
        <div className="flex bg-[var(--background)] min-h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 ml-64 h-full overflow-y-auto p-8 pb-12">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight" style={{ background: 'linear-gradient(135deg, #BF953F 0%, #FCF6BA 25%, #B38728 50%, #FBF5B7 75%, #AA771C 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Meu Relatório</h1>
                    <p className="text-[var(--muted)] mt-1">Visualizar meu desempenho</p>
                </header>

                <div className="bg-[var(--surface)] rounded-xl shadow-lg border border-[var(--border)] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[var(--surface-highlight)] border-b border-[var(--border)] text-[var(--muted)] uppercase text-xs font-semibold tracking-wider">
                                    <th className="p-4">ID Conversa</th>
                                    <th className="p-4">Cliente</th>
                                    <th className="p-4">Sessão</th>
                                    <th className="p-4">Chamado</th>
                                    <th className="p-4">Visualizou</th>
                                    <th className="p-4">Respondeu</th>
                                    <th className="p-4">Atendente</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {reportData.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-[var(--muted)] italic">
                                            Nenhum registro encontrado.
                                        </td>
                                    </tr>
                                ) : (
                                    reportData.map((item, index) => (
                                        <tr key={index} className="hover:bg-[var(--surface-highlight)] transition-colors text-sm group">
                                            <td className="p-4">
                                                {item.link_conversa ? (
                                                    <a
                                                        href={item.link_conversa}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[var(--primary)] hover:underline flex items-center gap-1 font-bold"
                                                    >
                                                        {item.id_conversa}
                                                        <ExternalLink size={12} />
                                                    </a>
                                                ) : (
                                                    <span className="text-[var(--primary)] font-bold">{item.id_conversa || '-'}</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-[var(--foreground)] opacity-90">{item.num_cliente || '-'}</td>
                                            <td className="p-4 text-[var(--foreground)] opacity-90">{item.sessao_disparo || '-'}</td>
                                            <td className="p-4 text-[var(--muted)] font-mono text-xs">{item.hora_chamado ? new Date(item.hora_chamado).toLocaleString('pt-BR') : '-'}</td>
                                            <td className="p-4 text-[var(--muted)] font-mono text-xs">{item.hora_visualizou ? new Date(item.hora_visualizou).toLocaleString('pt-BR') : '-'}</td>
                                            <td className="p-4 text-[var(--muted)] font-mono text-xs">{item.hora_respondeu ? new Date(item.hora_respondeu).toLocaleString('pt-BR') : '-'}</td>
                                            <td className="p-4 text-[var(--foreground)] opacity-90">{item.nome_atendente || '-'}</td>
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

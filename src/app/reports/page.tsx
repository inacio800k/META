'use client';

import React, { useEffect, useState } from 'react';
import { usePermission } from '@/hooks/usePermission';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { DataTable } from '@/components/ui/DataTable';
import { dataService } from '@/services/dataService';
import { useToast } from '@/contexts/ToastContext';

export default function ReportsPage() {
    const { hasRole, loading: authLoading } = usePermission();
    const { showToast } = useToast();
    const router = useRouter();
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !hasRole(['admin'])) {
            router.push('/');
        }
    }, [authLoading, hasRole, router]);

    useEffect(() => {
        if (authLoading || !hasRole(['admin'])) return;

        const fetchReports = async () => {
            try {
                const data = await dataService.getReports();
                setReports(data);
            } catch (error) {
                console.error('Error fetching reports:', error);
                showToast('Erro ao carregar relatórios.', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, [authLoading, hasRole]);

    if (authLoading || loading) {
        return (
            <div className="flex h-screen bg-gray-900 text-white items-center justify-center">
                <div className="text-xl">Carregando...</div>
            </div>
        );
    }

    if (!hasRole(['admin'])) return null;

    const columns = [
        { header: 'ID', accessor: 'id_chamada' },
        { header: 'Atendente', accessor: 'nome_atendente' },
        { header: 'Cliente', accessor: 'num_cliente' },
        { header: 'Status', accessor: 'status_chamada' },
        { header: 'Tipo', accessor: 'tipo_chamada' },
        {
            header: 'Hora',
            accessor: 'hora_chamado',
            render: (report: any) => {
                const value = report.hora_chamado;
                if (!value) return '-';
                try {
                    return new Date(value).toLocaleString('pt-BR');
                } catch (e) {
                    return value;
                }
            }
        },
        { header: 'Sessão', accessor: 'sessao_disparo' },
    ];

    return (
        <div className="flex bg-[var(--background)] min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold gold-gradient tracking-tight">Relatórios</h1>
                        <p className="text-[var(--muted)] mt-1">Visualize o histórico de atendimentos.</p>
                    </div>
                </header>

                <div className="bg-[var(--surface)] rounded-xl shadow-lg border border-[var(--border)] p-6">
                    <DataTable
                        data={reports}
                        columns={columns}
                        title="Relatórios de Atendimento"
                    />
                </div>
            </main>
        </div>
    );
}

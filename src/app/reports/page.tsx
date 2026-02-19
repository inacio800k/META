'use client';

import React, { useEffect, useState } from 'react';
import { usePermission } from '@/hooks/usePermission';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { dataService } from '@/services/dataService';
import { useToast } from '@/contexts/ToastContext';
import { Trash2 } from 'lucide-react';

export default function ReportsPage() {
    const { hasRole, loading: authLoading } = usePermission();
    const router = useRouter();
    const { showToast } = useToast();
    const [reports, setReports] = useState<any[]>([]);
    const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
    const [deleting, setDeleting] = useState(false);

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
            }
        };

        fetchReports();
    }, [authLoading, hasRole]);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            const res = await fetch('/api/reports/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: deleteTarget.id_chamada }),
            });

            const data = await res.json();

            if (!res.ok) {
                showToast(data.error || 'Erro ao excluir relatório', 'error');
            } else {
                showToast('Relatório excluído com sucesso!', 'success');
                setReports(prev => prev.filter(r => r.id_chamada !== deleteTarget.id_chamada));
            }
        } catch (error: any) {
            showToast(error?.message || 'Erro ao excluir relatório', 'error');
        } finally {
            setDeleting(false);
            setDeleteTarget(null);
        }
    };

    if (authLoading) return null;
    if (!hasRole(['admin'])) return null;

    const columns = [
        { header: 'ID', key: 'id_chamada' },
        { header: 'Atendente', key: 'nome_atendente' },
        { header: 'Cliente', key: 'num_cliente' },
        { header: 'Status', key: 'status_chamada', maxWidth: '90px' },
        { header: 'Tipo', key: 'tipo_chamada' },
        { header: 'Hora', key: 'hora_chamado', isDate: true },
        { header: 'Sessão', key: 'sessao_disparo' },
    ];

    return (
        <div className="flex bg-[var(--background)] min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 overflow-y-auto overflow-x-hidden">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold gold-gradient tracking-tight">Relatórios</h1>
                        <p className="text-[var(--muted)] mt-1">Visualize o histórico de atendimentos.</p>
                    </div>
                </header>

                <div
                    className="rounded-xl border border-[var(--border)] overflow-hidden"
                    style={{ background: 'var(--surface)' }}
                >
                    <div className="px-6 py-4 border-b border-[var(--border)]" style={{ background: 'var(--surface-highlight)' }}>
                        <h3 className="font-semibold text-[var(--foreground)] tracking-tight">Relatórios de Atendimento</h3>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
                            <thead>
                                <tr style={{ background: 'var(--surface-highlight)', borderBottom: '1px solid var(--border)' }}>
                                    {columns.map((col, idx) => (
                                        <th
                                            key={idx}
                                            style={{
                                                padding: '12px 16px',
                                                textAlign: 'left',
                                                fontSize: '11px',
                                                fontWeight: 600,
                                                color: '#C0C0C0',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em',
                                                whiteSpace: 'nowrap',
                                                ...(col.maxWidth ? { maxWidth: col.maxWidth, width: col.maxWidth } : {}),
                                            }}
                                        >
                                            {col.header}
                                        </th>
                                    ))}
                                    <th
                                        style={{
                                            padding: '12px 16px',
                                            textAlign: 'center',
                                            fontSize: '11px',
                                            fontWeight: 600,
                                            color: 'var(--muted)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            whiteSpace: 'nowrap',
                                            width: '60px',
                                        }}
                                    >
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={columns.length + 1}
                                            style={{
                                                padding: '32px 16px',
                                                textAlign: 'center',
                                                color: 'var(--muted)',
                                                fontSize: '14px',
                                                fontStyle: 'italic',
                                            }}
                                        >
                                            Nenhum dado encontrado
                                        </td>
                                    </tr>
                                ) : (
                                    reports.map((report, idx) => (
                                        <tr
                                            key={idx}
                                            style={{
                                                borderBottom: '1px solid var(--border)',
                                                transition: 'background 150ms',
                                            }}
                                            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-highlight)')}
                                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                        >
                                            {columns.map((col, colIdx) => {
                                                let value = report[col.key];
                                                if (col.isDate && value) {
                                                    try {
                                                        value = new Date(value).toLocaleString('pt-BR');
                                                    } catch { /* keep original */ }
                                                }
                                                return (
                                                    <td
                                                        key={colIdx}
                                                        style={{
                                                            padding: '12px 16px',
                                                            fontSize: '13px',
                                                            color: 'var(--foreground)',
                                                            whiteSpace: 'nowrap',
                                                            ...(col.maxWidth ? { maxWidth: col.maxWidth, overflow: 'hidden', textOverflow: 'ellipsis' } : {}),
                                                        }}
                                                    >
                                                        {value ?? '-'}
                                                    </td>
                                                );
                                            })}
                                            <td style={{ padding: '12px 8px', textAlign: 'center', width: '60px' }}>
                                                <button
                                                    onClick={() => setDeleteTarget(report)}
                                                    title="Excluir relatório"
                                                    style={{
                                                        background: 'linear-gradient(135deg, #5C1A1A 0%, #8B2E2E 40%, #A04040 60%, #8B2E2E 80%, #5C1A1A 100%)',
                                                        border: '1px solid rgba(139, 46, 46, 0.5)',
                                                        borderRadius: '8px',
                                                        padding: '6px 8px',
                                                        cursor: 'pointer',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        transition: 'all 150ms',
                                                        boxShadow: '0 2px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(160,64,64,0.3)',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = 'linear-gradient(135deg, #7A2020 0%, #A83C3C 40%, #C05050 60%, #A83C3C 80%, #7A2020 100%)';
                                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(139,46,46,0.5), inset 0 1px 0 rgba(192,80,80,0.4)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = 'linear-gradient(135deg, #5C1A1A 0%, #8B2E2E 40%, #A04040 60%, #8B2E2E 80%, #5C1A1A 100%)';
                                                        e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3), inset 0 1px 0 rgba(160,64,64,0.3)';
                                                    }}
                                                >
                                                    <Trash2 size={14} color="#E8B4B4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(4px)',
                    }}
                    onClick={() => !deleting && setDeleteTarget(null)}
                >
                    <div
                        style={{
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: '16px',
                            padding: '28px',
                            maxWidth: '440px',
                            width: '90%',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <div
                                style={{
                                    background: 'linear-gradient(135deg, #5C1A1A, #8B2E2E)',
                                    borderRadius: '10px',
                                    padding: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Trash2 size={20} color="#E8B4B4" />
                            </div>
                            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--foreground)' }}>
                                Excluir Relatório
                            </h3>
                        </div>

                        <p style={{ fontSize: '14px', color: '#EF4444', lineHeight: 1.6, marginBottom: '24px' }}>
                            Tem certeza de que deseja excluir o relatório entre{' '}
                            <strong style={{ color: 'var(--foreground)' }}>{deleteTarget.sessao_disparo || '-'}</strong>{' '}
                            e{' '}
                            <strong style={{ color: 'var(--foreground)' }}>{deleteTarget.num_cliente || '-'}</strong>?
                        </p>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setDeleteTarget(null)}
                                disabled={deleting}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '10px',
                                    border: '1px solid var(--border)',
                                    background: 'var(--background)',
                                    color: 'var(--foreground)',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 150ms',
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                style={{
                                    padding: '10px 20px',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(139,46,46,0.5)',
                                    background: 'linear-gradient(135deg, #5C1A1A 0%, #8B2E2E 40%, #A04040 60%, #8B2E2E 80%, #5C1A1A 100%)',
                                    color: '#E8B4B4',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    cursor: deleting ? 'not-allowed' : 'pointer',
                                    opacity: deleting ? 0.6 : 1,
                                    transition: 'all 150ms',
                                    boxShadow: '0 2px 8px rgba(139,46,46,0.3)',
                                }}
                            >
                                {deleting ? 'Excluindo...' : 'Excluir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

'use client';

import React, { useEffect, useState } from 'react';
import { usePermission } from '@/hooks/usePermission';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { dataService } from '@/services/dataService';

import { useAuth } from '@/contexts/AuthContext';
import { ChevronDown, ChevronUp, User } from 'lucide-react';

interface Zap {
    numero: string;
    status: string;
    // Add other properties if available
}

interface Vendedor {
    id: string | number;
    nome: string;
    quantidade_zaps: number;
    zaps: Zap[] | string[]; // Handling both object array or string array
}

export default function VendedoresPage() {
    const { hasRole, loading: authLoading } = usePermission();
    const router = useRouter();

    const { user } = useAuth();
    const [vendedores, setVendedores] = useState<Vendedor[]>([]);

    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (!authLoading && !hasRole(['admin', 'operador'])) {
            router.push('/');
        }
    }, [authLoading, hasRole, router]);

    useEffect(() => {
        if (authLoading || !hasRole(['admin', 'operador'])) return;

        const fetchData = async () => {
            try {
                const result = await dataService.getVendedores();
                // Ensure result is an array, if it's wrapped in an object, try to find the array
                let dataArray: Vendedor[] = [];
                if (Array.isArray(result)) {
                    dataArray = result;
                } else if (result && typeof result === 'object') {
                    // Try to find an array property
                    const possibleArray = Object.values(result).find(val => Array.isArray(val));
                    if (possibleArray) {
                        dataArray = possibleArray as Vendedor[];
                    }
                }

                setVendedores(dataArray);
            } catch (error) {
                console.error('Error fetching vendedores:', error);
            }
        };

        fetchData();
    }, [authLoading, hasRole]);

    const toggleRow = (id: string | number) => {
        setExpandedRows(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    if (authLoading) return null;

    if (!hasRole(['admin', 'operador'])) return null;

    return (
        <div className="flex bg-[var(--background)] min-h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 ml-64 h-full overflow-y-auto p-8 pb-12">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight" style={{ background: 'linear-gradient(135deg, #BF953F 0%, #FCF6BA 25%, #B38728 50%, #FBF5B7 75%, #AA771C 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Vendedores</h1>
                    <p className="text-[var(--muted)] mt-1">Gestão de Contas de Vendedores</p>
                </header>

                <div className="bg-[var(--surface)] rounded-xl shadow-lg border border-[var(--border)] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[var(--surface-highlight)] border-b border-[var(--border)] text-[#C0C0C0] uppercase text-xs font-semibold tracking-wider">
                                    <th className="p-4">ID</th>
                                    <th className="p-4">Nome</th>
                                    <th className="p-4 text-center">Quantidade Zaps</th>
                                    <th className="p-4 text-right">Detalhes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {vendedores.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-[var(--muted)] italic">
                                            Nenhum vendedor encontrado.
                                        </td>
                                    </tr>
                                ) : (
                                    vendedores.map((vendedor) => (
                                        <React.Fragment key={vendedor.id}>
                                            <tr className="hover:bg-[var(--surface-highlight)] transition-colors duration-150 group">
                                                <td className="p-4 font-mono text-sm text-[var(--muted)]">{vendedor.id}</td>
                                                <td className="p-4 font-medium text-[var(--foreground)] group-hover:text-white transition-colors">
                                                    {vendedor.nome}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className={`font-bold ${Number(vendedor.quantidade_zaps) === 0
                                                        ? 'text-red-500'
                                                        : 'text-[var(--foreground)]'
                                                        }`}>
                                                        {vendedor.quantidade_zaps}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button
                                                        onClick={() => toggleRow(vendedor.id)}
                                                        className="p-2 hover:bg-[var(--surface-highlight)] rounded-full transition-colors text-[var(--muted)] hover:text-[var(--foreground)]"
                                                        title={expandedRows[vendedor.id] ? "Ocultar Zaps" : "Ver Zaps"}
                                                    >
                                                        {expandedRows[vendedor.id] ? (
                                                            <ChevronUp size={20} />
                                                        ) : (
                                                            <ChevronDown size={20} />
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                            {expandedRows[vendedor.id] && (
                                                <tr className="bg-[var(--surface)]">
                                                    <td colSpan={4} className="p-4 border-b border-[var(--border)] pl-12">
                                                        <div className="bg-[var(--background)] rounded-lg border border-[var(--border)] p-4">
                                                            <h4 className="text-sm font-bold mb-3 text-[var(--muted)] uppercase tracking-wider">
                                                                Lista de Zaps Vinculados
                                                            </h4>
                                                            {(!vendedor.zaps || vendedor.zaps.length === 0) ? (
                                                                <p className="text-sm text-[var(--muted)] italic">Nenhum número vinculado.</p>
                                                            ) : (
                                                                <ul className="space-y-2">
                                                                    {vendedor.zaps.map((zap, idx) => (
                                                                        <li key={idx} className="flex items-center gap-2 text-sm p-2 rounded hover:bg-[var(--surface-highlight)] transition-colors border border-transparent hover:border-[var(--border)] text-[var(--foreground)]">
                                                                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                                            <span className="font-mono">
                                                                                {typeof zap === 'string' ? zap : (zap.numero || JSON.stringify(zap))}
                                                                            </span>
                                                                            {typeof zap !== 'string' && zap.status && (
                                                                                <span className="text-xs text-[var(--muted)] ml-2">({zap.status})</span>
                                                                            )}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
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

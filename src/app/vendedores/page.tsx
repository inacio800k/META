'use client';

import React, { useEffect, useState } from 'react';
import { usePermission } from '@/hooks/usePermission';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { dataService } from '@/services/dataService';
import { useToast } from '@/contexts/ToastContext';
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
    const { showToast } = useToast();
    const { user } = useAuth();
    const [vendedores, setVendedores] = useState<Vendedor[]>([]);
    const [loading, setLoading] = useState(true);
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
                showToast('Dados de vendedores carregados', 'success');
            } catch (error) {
                console.error('Error fetching vendedores:', error);
                showToast('Erro ao carregar vendedores', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [authLoading, hasRole, showToast]);

    const toggleRow = (id: string | number) => {
        setExpandedRows(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    if (authLoading || loading) {
        return (
            <div className="flex h-screen bg-[#121212] text-[#FFE600] items-center justify-center">
                <div className="text-xl">Carregando...</div>
            </div>
        );
    }

    if (!hasRole(['admin', 'operador'])) return null;

    return (
        <div className="flex h-screen bg-[#121212] text-[#FFE600] overflow-hidden">
            <Sidebar />
            <main className="flex-1 ml-64 h-full overflow-y-auto p-8 pb-12">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold neon-text">Vendedores</h1>
                    <p className="text-[#FFE600] opacity-80">Gestão de Contas de Vendedores</p>
                </header>

                <div className="bg-[#1E1E1E] rounded-lg shadow-lg border border-[#333] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#2a2a2a] border-b border-[#333] text-[#FFE600] uppercase text-xs font-bold tracking-wider">
                                    <th className="p-4">ID</th>
                                    <th className="p-4">Nome</th>
                                    <th className="p-4 text-center">Quantidade Zaps</th>
                                    <th className="p-4 text-right">Detalhes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#333]">
                                {vendedores.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-gray-500">
                                            Nenhum vendedor encontrado.
                                        </td>
                                    </tr>
                                ) : (
                                    vendedores.map((vendedor) => (
                                        <React.Fragment key={vendedor.id}>
                                            <tr className="hover:bg-[#252525] transition-colors">
                                                <td className="p-4 font-mono text-sm opacity-80">{vendedor.id}</td>
                                                <td className="p-4 font-medium">
                                                    {vendedor.nome}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className={`font-bold ${Number(vendedor.quantidade_zaps) === 0
                                                        ? 'text-red-500'
                                                        : 'text-[#FFE600]'
                                                        }`}>
                                                        {vendedor.quantidade_zaps}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <button
                                                        onClick={() => toggleRow(vendedor.id)}
                                                        className="p-2 hover:bg-yellow-600/20 rounded-full transition-colors"
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
                                                <tr className="bg-[#181818]">
                                                    <td colSpan={4} className="p-4 border-b border-[#333] pl-12">
                                                        <div className="bg-[#121212] rounded-md border border-[#333] p-4">
                                                            <h4 className="text-sm font-bold mb-3 text-gray-400 uppercase tracking-wider">
                                                                Lista de Zaps Vinculados
                                                            </h4>
                                                            {(!vendedor.zaps || vendedor.zaps.length === 0) ? (
                                                                <p className="text-sm text-gray-500 italic">Nenhum número vinculado.</p>
                                                            ) : (
                                                                <ul className="space-y-2">
                                                                    {vendedor.zaps.map((zap, idx) => (
                                                                        <li key={idx} className="flex items-center gap-2 text-sm p-2 rounded hover:bg-[#1E1E1E] transition-colors border border-transparent hover:border-[#333]">
                                                                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                                            <span className="font-mono text-[#FFE600]">
                                                                                {typeof zap === 'string' ? zap : (zap.numero || JSON.stringify(zap))}
                                                                            </span>
                                                                            {typeof zap !== 'string' && zap.status && (
                                                                                <span className="text-xs text-gray-400 ml-2">({zap.status})</span>
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

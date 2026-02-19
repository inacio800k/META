'use client';

import React, { useEffect, useState } from 'react';
import { usePermission } from '@/hooks/usePermission';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Modal } from '@/components/ui/Modal';
import { DataTable } from '@/components/ui/DataTable';
import { Plus, Pencil } from 'lucide-react';
import { dataService } from '@/services/dataService';
import { SessionData } from '@/types';
import { useToast } from '@/contexts/ToastContext';

export default function SessionsPage() {
    const { hasRole, loading: authLoading } = usePermission();
    const router = useRouter();
    const { showToast } = useToast();
    const [sessions, setSessions] = useState<SessionData[]>([]);
    const [vendedores, setVendedores] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState<SessionData | null>(null);
    const [selectedVendorId, setSelectedVendorId] = useState<string>('');
    const [editingSession, setEditingSession] = useState<any>({});

    // Add Session Modal State
    const [formData, setFormData] = useState({
        sessao: '',
        origem_atendimento: 'VENDEDOR',
        tipo_atendimento: '',
        nome_atendente: '',
        nome_app: '',
        numero: '',
        id_numero: '',
        id_business: '',
        id_aplicativo: '',
        token_permanente: ''
    });

    // Reset form when modal opens
    useEffect(() => {
        if (isAddModalOpen) {
            setFormData({
                sessao: '',
                origem_atendimento: 'VENDEDOR',
                tipo_atendimento: '',
                nome_atendente: '',
                nome_app: '',
                numero: '',
                id_numero: '',
                id_business: '',
                id_aplicativo: '',
                token_permanente: ''
            });
        }
    }, [isAddModalOpen]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'numero') {
            // Only allow digits
            const numericValue = value.replace(/\D/g, '');
            // Limit length to 13 (max)
            if (numericValue.length <= 13) {
                setFormData(prev => ({ ...prev, [name]: numericValue }));
            }
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddSession = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate number length
        // Validate number length
        if (formData.numero.length < 12 || formData.numero.length > 13) {
            showToast('O campo Número deve ter entre 12 e 13 dígitos.', 'error');
            return;
        }

        try {
            await dataService.createSession(formData);
            setIsAddModalOpen(false);
            // Form reset is handled by useEffect on next open, but good to reset here too or just close
            // Refresh list
            const data = await dataService.getSessions();
            setSessions(data.sessoes);
            setVendedores(data.vendedores);
            showToast('Sessão criada com sucesso!', 'success');
        } catch (error) {
            showToast('Erro ao criar sessão', 'error');
            console.error(error);
        }
    };

    useEffect(() => {
        if (!authLoading && !hasRole(['admin', 'operador'])) {
            router.push('/');
        }
    }, [authLoading, hasRole, router]);

    useEffect(() => {
        // Prevent fetching if still loading auth (local loading is managed inside)
        if (authLoading || !hasRole(['admin', 'operador'])) return;

        const fetchSessions = async () => {
            try {
                const data = await dataService.getSessions();
                setSessions(data.sessoes);
                setVendedores(data.vendedores);
            } catch (error) {
                console.error('Error fetching sessions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
    }, [authLoading, hasRole]);

    if (authLoading || loading) {
        return (
            <div className="flex h-screen bg-[var(--background)] items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="skeleton h-4 w-48"></div>
                    <div className="skeleton h-3 w-32"></div>
                </div>
            </div>
        );
    }

    if (!hasRole(['admin', 'operador'])) return null;

    const columns = [
        { header: 'ID', accessor: 'id' as keyof SessionData },
        { header: 'Atendente', accessor: 'nome_atendente' as keyof SessionData },
        { header: 'VENDEDOR', accessor: 'vendedor_chatwoot' as keyof SessionData },
        { header: 'Sessão', accessor: 'sessao' as keyof SessionData },
        { header: 'Origem', accessor: 'origem_atendimento' as keyof SessionData },
        { header: 'App', accessor: 'nome_app' as keyof SessionData },
        {
            header: 'Ações',
            accessor: (item: SessionData) => {
                return (
                    <div className="flex space-x-2">
                        {hasRole(['admin']) && (
                            <button
                                onClick={() => handleEditClick(item)}
                                className="text-blue-500 hover:text-blue-400 p-1"
                                title="Editar Sessão"
                            >
                                <Pencil size={16} />
                            </button>
                        )}
                        {item.origem_atendimento?.toUpperCase() === 'VENDEDOR' && (
                            <button
                                onClick={() => {
                                    setSelectedSession(item);
                                    setSelectedVendorId('');
                                    setIsAssignModalOpen(true);
                                }}
                                className="text-[var(--primary)] underline hover:text-[var(--foreground)] text-xs cursor-pointer"
                            >
                                Atribuir
                            </button>
                        )}
                    </div>
                );
            }
        }
    ];

    const handleAssignVendor = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSession || !selectedVendorId) return;

        const vendor = vendedores.find(v => v.id.toString() === selectedVendorId);
        if (!vendor) return;

        try {
            await dataService.assignVendor({
                id_sessao: selectedSession.id,
                sessao: selectedSession.sessao,
                id_vendedor: vendor.id,
                nome_vendedor: vendor.nome
            });
            showToast('Vendedor atribuído com sucesso!', 'success');
            setIsAssignModalOpen(false);
            // Refresh list
            const result = await dataService.getSessions();
            setSessions(result.sessoes);
            setVendedores(result.vendedores);
        } catch (error) {
            console.error('Error assigning vendor:', error);
            showToast('Erro ao atribuir vendedor.', 'error');
        }
    };

    const handleEditClick = (session: SessionData) => {
        // Create a normalized version of the session for editing
        // This ensures dropdowns have matching values
        const normalizedSession = {
            ...session,
            // Ensure uppercase for VENDEDOR/IA
            origem_atendimento: session.origem_atendimento ? session.origem_atendimento.toUpperCase() : 'VENDEDOR'
        };
        setEditingSession(normalizedSession);
        setIsEditModalOpen(true);
    };

    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditingSession((prev: any) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleEditSession = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await dataService.editSession(editingSession);
            setIsEditModalOpen(false);
            // Refresh list
            // Refresh list
            const result = await dataService.getSessions();
            setSessions(result.sessoes);
            showToast('Sessão editada com sucesso!', 'success');
        } catch (error) {
            console.error('Error editing session:', error);
            showToast('Erro ao editar sessão.', 'error');
        }
    };

    return (
        <div className="flex bg-[var(--background)] min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold gold-gradient tracking-tight">Sessões Ativas</h1>
                        <p className="text-[var(--muted)] mt-1">Gerencie as sessões de atendimento.</p>
                    </div>

                    {hasRole(['admin', 'operador']) && (
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center space-x-2 px-5 py-2.5 rounded-lg cursor-pointer font-bold"
                            style={{ background: 'linear-gradient(145deg, #92700C 0%, #BF9B30 15%, #DBCA6E 35%, #FFEC8A 50%, #DBCA6E 65%, #BF9B30 85%, #92700C 100%)', color: '#1A1200', border: '1px solid rgba(255,236,138,0.3)', boxShadow: '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,250,220,0.4), inset 0 -1px 0 rgba(146,112,12,0.3)', textShadow: '0 1px 0 rgba(255,250,220,0.3)' }}
                        >
                            <Plus size={20} />
                            <span>Adicionar Sessão</span>
                        </button>
                    )}
                </header>

                <div className="bg-[var(--surface)] rounded-xl shadow-lg border border-[var(--border)] p-6">
                    <DataTable
                        data={sessions}
                        columns={columns}
                        title="Lista de Sessões"
                    />
                </div>

                <Modal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    title="Criar Nova Sessão"
                    className="max-w-4xl"
                >
                    <form onSubmit={handleAddSession} className="space-y-4 max-h-[80vh] overflow-y-auto px-1 custom-scrollbar" autoComplete="off">
                        <div>
                            <label className="block text-sm font-medium text-[var(--muted)]">Sessão</label>
                            <input
                                name="sessao"
                                type="text"
                                required
                                autoComplete="off"
                                className="mt-1 block w-full rounded-lg border-[var(--border)] bg-[var(--surface-highlight)] text-[var(--foreground)] shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)] sm:text-sm p-2.5 transition-all placeholder-[var(--muted)]"
                                value={formData.sessao}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--muted)]">Origem Atendimento</label>
                            <select
                                name="origem_atendimento"
                                className="mt-1 block w-full rounded-lg border-[var(--border)] bg-[var(--surface-highlight)] text-[var(--foreground)] shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)] sm:text-sm p-2.5 transition-all"
                                value={formData.origem_atendimento}
                                onChange={handleInputChange}
                            >
                                <option value="VENDEDOR">VENDEDOR</option>
                                <option value="IA">IA</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--muted)]">Tipo Atendimento</label>
                                <input
                                    name="tipo_atendimento"
                                    type="text"
                                    required
                                    autoComplete="off"
                                    className="mt-1 block w-full rounded-lg border-[var(--border)] bg-[var(--surface-highlight)] text-[var(--foreground)] shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)] sm:text-sm p-2.5 transition-all placeholder-[var(--muted)]"
                                    value={formData.tipo_atendimento}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--muted)]">Nome Atendente</label>
                                <input
                                    name="nome_atendente"
                                    type="text"
                                    required
                                    autoComplete="off"
                                    className="mt-1 block w-full rounded-lg border-[var(--border)] bg-[var(--surface-highlight)] text-[var(--foreground)] shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)] sm:text-sm p-2.5 transition-all placeholder-[var(--muted)]"
                                    value={formData.nome_atendente}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--muted)]">Nome do Aplicativo</label>
                            <input
                                name="nome_app"
                                type="text"
                                required
                                autoComplete="off"
                                className="mt-1 block w-full rounded-lg border-[var(--border)] bg-[var(--surface-highlight)] text-[var(--foreground)] shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)] sm:text-sm p-2.5 transition-all placeholder-[var(--muted)]"
                                value={formData.nome_app}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--muted)]">Número</label>
                                <input
                                    name="numero"
                                    type="text"
                                    required
                                    autoComplete="off"
                                    className="mt-1 block w-full rounded-lg border-[var(--border)] bg-[var(--surface-highlight)] text-[var(--foreground)] shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)] sm:text-sm p-2.5 transition-all placeholder-[var(--muted)]"
                                    value={formData.numero}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--muted)]">ID Número</label>
                                <input
                                    name="id_numero"
                                    type="text"
                                    required
                                    autoComplete="off"
                                    className="mt-1 block w-full rounded-lg border-[var(--border)] bg-[var(--surface-highlight)] text-[var(--foreground)] shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)] sm:text-sm p-2.5 transition-all placeholder-[var(--muted)]"
                                    value={formData.id_numero}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--muted)]">ID Business</label>
                                <input
                                    name="id_business"
                                    type="text"
                                    required
                                    autoComplete="off"
                                    className="mt-1 block w-full rounded-lg border-[var(--border)] bg-[var(--surface-highlight)] text-[var(--foreground)] shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)] sm:text-sm p-2.5 transition-all placeholder-[var(--muted)]"
                                    value={formData.id_business}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--muted)]">ID Aplicativo</label>
                                <input
                                    name="id_aplicativo"
                                    type="text"
                                    required
                                    autoComplete="off"
                                    className="mt-1 block w-full rounded-lg border-[var(--border)] bg-[var(--surface-highlight)] text-[var(--foreground)] shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)] sm:text-sm p-2.5 transition-all placeholder-[var(--muted)]"
                                    value={formData.id_aplicativo}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--muted)]">Token Permanente</label>
                            <input
                                name="token_permanente"
                                type="text"
                                required
                                autoComplete="off"
                                className="mt-1 block w-full rounded-lg border-[var(--border)] bg-[var(--surface-highlight)] text-[var(--foreground)] shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)] sm:text-sm p-2.5 transition-all placeholder-[var(--muted)]"
                                value={formData.token_permanente}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                type="button"
                                onClick={() => setIsAddModalOpen(false)}
                                className="px-4 py-2 border border-[var(--border)] rounded-lg text-sm font-medium text-[var(--muted)] hover:bg-[var(--surface-highlight)] transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-bold text-black bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-all"
                            >
                                Salvar
                            </button>
                        </div>
                    </form>
                </Modal>

                <Modal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    title="Editar Sessão"
                    className="max-w-4xl"
                >
                    <form onSubmit={handleEditSession} className="space-y-4 max-h-[80vh] overflow-y-auto px-1 custom-scrollbar" autoComplete="off">
                        <div>
                            <label className="block text-sm font-medium text-[var(--muted)]">Sessão</label>
                            <input
                                name="sessao"
                                type="text"
                                required
                                autoComplete="off"
                                className="mt-1 block w-full rounded-lg border-[var(--border)] bg-[var(--surface-highlight)] text-[var(--foreground)] shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)] sm:text-sm p-2.5 transition-all placeholder-[var(--muted)]"
                                value={editingSession.sessao || ''}
                                onChange={handleEditInputChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--muted)]">Origem Atendimento</label>
                            <select
                                name="origem_atendimento"
                                className="mt-1 block w-full rounded-lg border-[var(--border)] bg-[var(--surface-highlight)] text-[var(--foreground)] shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)] sm:text-sm p-2.5 transition-all"
                                value={editingSession.origem_atendimento || ''}
                                onChange={handleEditInputChange}
                            >
                                <option value="VENDEDOR">VENDEDOR</option>
                                <option value="IA">IA</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--muted)]">Tipo Atendimento</label>
                                <input
                                    name="tipo_atendimento"
                                    type="text"
                                    required
                                    autoComplete="off"
                                    className="mt-1 block w-full rounded-lg border-[var(--border)] bg-[var(--surface-highlight)] text-[var(--foreground)] shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)] sm:text-sm p-2.5 transition-all placeholder-[var(--muted)]"
                                    value={editingSession.tipo_atendimento || ''}
                                    onChange={handleEditInputChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--muted)]">Nome Atendente</label>
                                <input
                                    name="nome_atendente"
                                    type="text"
                                    required
                                    autoComplete="off"
                                    className="mt-1 block w-full rounded-lg border-[var(--border)] bg-[var(--surface-highlight)] text-[var(--foreground)] shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)] sm:text-sm p-2.5 transition-all placeholder-[var(--muted)]"
                                    value={editingSession.nome_atendente || ''}
                                    onChange={handleEditInputChange}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--muted)]">Nome do Aplicativo</label>
                            <input
                                name="nome_app"
                                type="text"
                                required
                                autoComplete="off"
                                className="mt-1 block w-full rounded-lg border-[var(--border)] bg-[var(--surface-highlight)] text-[var(--foreground)] shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)] sm:text-sm p-2.5 transition-all placeholder-[var(--muted)]"
                                value={editingSession.nome_app || ''}
                                onChange={handleEditInputChange}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--muted)]">Número</label>
                                <input
                                    name="numero"
                                    type="text"
                                    required
                                    autoComplete="off"
                                    className="mt-1 block w-full rounded-lg border-[var(--border)] bg-[var(--surface-highlight)] text-[var(--foreground)] shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)] sm:text-sm p-2.5 transition-all placeholder-[var(--muted)]"
                                    value={editingSession.numero || ''}
                                    onChange={handleEditInputChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--muted)]">ID Número</label>
                                <input
                                    name="id_numero"
                                    type="text"
                                    required
                                    autoComplete="off"
                                    className="mt-1 block w-full rounded-lg border-[var(--border)] bg-[var(--surface-highlight)] text-[var(--foreground)] shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)] sm:text-sm p-2.5 transition-all placeholder-[var(--muted)]"
                                    value={editingSession.id_numero || ''}
                                    onChange={handleEditInputChange}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--muted)]">ID Business</label>
                                <input
                                    name="id_business"
                                    type="text"
                                    required
                                    autoComplete="off"
                                    className="mt-1 block w-full rounded-lg border-[var(--border)] bg-[var(--surface-highlight)] text-[var(--foreground)] shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)] sm:text-sm p-2.5 transition-all placeholder-[var(--muted)]"
                                    value={editingSession.id_business || ''}
                                    onChange={handleEditInputChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--muted)]">ID Aplicativo</label>
                                <input
                                    name="id_aplicativo"
                                    type="text"
                                    required
                                    autoComplete="off"
                                    className="mt-1 block w-full rounded-lg border-[var(--border)] bg-[var(--surface-highlight)] text-[var(--foreground)] shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)] sm:text-sm p-2.5 transition-all placeholder-[var(--muted)]"
                                    value={editingSession.id_aplicativo || ''}
                                    onChange={handleEditInputChange}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--muted)]">Token Permanente</label>
                            <input
                                name="token_permanente"
                                type="text"
                                required
                                autoComplete="off"
                                className="mt-1 block w-full rounded-lg border-[var(--border)] bg-[var(--surface-highlight)] text-[var(--foreground)] shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)] sm:text-sm p-2.5 transition-all placeholder-[var(--muted)]"
                                value={editingSession.token_permanente || ''}
                                onChange={handleEditInputChange}
                            />
                        </div>
                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                type="button"
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-4 py-2 border border-[var(--border)] rounded-lg text-sm font-medium text-[var(--muted)] hover:bg-[var(--surface-highlight)] transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-bold text-black bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-all"
                            >
                                Salvar
                            </button>
                        </div>
                    </form>
                </Modal>

                <Modal
                    isOpen={isAssignModalOpen}
                    onClose={() => setIsAssignModalOpen(false)}
                    title="Atribuir Vendedor à Sessão"
                >
                    <form onSubmit={handleAssignVendor} className="space-y-4">
                        <div>
                            <p className="text-sm text-[var(--foreground)] mb-2">Sessão: {selectedSession?.sessao}</p>
                            <label className="block text-sm font-medium text-[var(--muted)]">Selecione o Vendedor</label>
                            <select
                                className="mt-1 block w-full rounded-lg border-[var(--border)] bg-[var(--surface-highlight)] text-[var(--foreground)] shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)] sm:text-sm p-2.5 transition-all"
                                value={selectedVendorId}
                                onChange={(e) => setSelectedVendorId(e.target.value)}
                                required
                            >
                                <option value="">Selecione...</option>
                                {vendedores.map((v: any) => (
                                    <option key={v.id} value={v.id}>
                                        {v.nome}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                type="button"
                                onClick={() => setIsAssignModalOpen(false)}
                                className="px-4 py-2 border border-[var(--border)] rounded-lg text-sm font-medium text-[var(--muted)] hover:bg-[var(--surface-highlight)] transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-bold text-black bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-all"
                            >
                                Salvar
                            </button>
                        </div>
                    </form>
                </Modal>
            </main>
        </div>
    );
}

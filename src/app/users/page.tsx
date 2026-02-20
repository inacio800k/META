'use client';

import React, { useEffect, useState } from 'react';
import { usePermission } from '@/hooks/usePermission';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { DataTable } from '@/components/ui/DataTable';
import { dataService } from '@/services/dataService';
import { Edit2, Link } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/contexts/ToastContext';

export default function UsersPage() {
    const { hasRole, loading: authLoading } = usePermission();
    const router = useRouter();
    const { showToast } = useToast();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Edit State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!authLoading && !hasRole(['admin'])) {
            router.push('/');
        }
    }, [authLoading, hasRole, router]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await dataService.getUsers();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
            showToast('Erro ao carregar usuários.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authLoading || !hasRole(['admin'])) return;
        fetchUsers();
    }, [authLoading, hasRole]);

    const handleEditClick = (user: any) => {
        setEditingUser({ ...user }); // Copy user data
        setIsEditModalOpen(true);
    };

    const handleSaveUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // Optimistic update or wait for refresh
            await dataService.updateUser(editingUser);
            showToast('Usuário atualizado com sucesso!', 'success');
            setIsEditModalOpen(false);
            fetchUsers(); // Refresh list
        } catch (error: any) {
            console.error('Error updating user:', error);
            showToast(`Erro ao atualizar usuário: ${error.message}`, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleLinkChatwoot = async () => {
        try {
            await dataService.linkChatwoot();
            showToast('Chatwoot linkado com sucesso!', 'success');
        } catch (error) {
            console.error('Error linking chatwoot:', error);
            showToast('Erro ao linkar Chatwoot.', 'error');
        }
    };

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

    if (!hasRole(['admin'])) return null;

    const columns = [
        { header: 'ID', accessor: 'id' },
        { header: 'Nome', accessor: 'nome' },
        { header: 'Email', accessor: 'email' },
        {
            header: 'Role',
            accessor: 'role',
            render: (user: any) => {
                const roleStyles: Record<string, { label: string; gradient: string; shadow: string }> = {
                    admin: { label: 'ADMINISTRADOR', gradient: 'linear-gradient(135deg, #BF953F 0%, #FCF6BA 25%, #B38728 50%, #FBF5B7 75%, #AA771C 100%)', shadow: '0 0 4px rgba(212,175,55,0.5)' },
                    operador: { label: 'OPERADOR', gradient: 'linear-gradient(135deg, #1E5FA8 0%, #7EC8E3 25%, #2B6CB0 50%, #A3D9F5 75%, #1A4F8B 100%)', shadow: '0 0 4px rgba(59,130,246,0.5)' },
                    vendedor: { label: 'VENDEDOR', gradient: 'linear-gradient(135deg, #1B7A3D 0%, #7EEAA0 25%, #228B47 50%, #A8F0C0 75%, #166B34 100%)', shadow: '0 0 4px rgba(34,197,94,0.5)' },
                };
                const config = roleStyles[user.role] || { label: user.role, gradient: 'linear-gradient(135deg, #BF953F, #FCF6BA, #AA771C)', shadow: 'none' };
                return <span className="font-extrabold" style={{ background: config.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', filter: `drop-shadow(${config.shadow})` }}>{config.label}</span>;
            }
        },
        {
            header: 'Ações',
            accessor: (user: any) => (
                <button
                    onClick={() => handleEditClick(user)}
                    className="text-[var(--primary)] opacity-80 hover:text-[var(--primary)] hover:opacity-100 transition-colors cursor-pointer"
                >
                    <Edit2 size={18} />
                </button>
            )
        },
    ];

    return (
        <div className="flex bg-[var(--background)] min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold gold-gradient tracking-tight">Controle de Usuários</h1>
                        <p className="text-[var(--muted)] mt-1">Gerencie os usuários e permissões do sistema.</p>
                    </div>
                    <div className="flex space-x-4">
                        <button
                            onClick={handleLinkChatwoot}
                            className="flex items-center space-x-2 px-6 py-2.5 rounded-lg cursor-pointer font-bold text-sm tracking-wide transition-all shadow-lg hover:scale-105 active:scale-95"
                            style={{
                                background: 'linear-gradient(145deg, #1E5FA8 0%, #2B6CB0 15%, #7EC8E3 35%, #A3D9F5 50%, #7EC8E3 65%, #2B6CB0 85%, #1E5FA8 100%)',
                                color: '#091522',
                                border: '1px solid rgba(163,217,245,0.3)',
                                boxShadow: '0 4px 15px rgba(30,95,168,0.3), inset 0 1px 0 rgba(163,217,245,0.4)',
                                textShadow: '0 1px 0 rgba(163,217,245,0.3)',
                            }}
                        >
                            <Link size={16} />
                            <span>Linkar Chatwoot</span>
                        </button>
                    </div>
                </header>

                <div className="bg-[var(--surface)] rounded-xl shadow-lg border border-[var(--border)] p-6">
                    <DataTable
                        data={users}
                        columns={columns}
                        title="Lista de Usuários"
                    />
                </div>

                <Modal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    title="Editar Usuário"
                >
                    {editingUser && (
                        <form onSubmit={handleSaveUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-[var(--muted)]">Nome</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full rounded-lg border-[var(--border)] bg-[var(--surface-highlight)] text-[var(--foreground)] shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)] sm:text-sm p-2.5 border transition-all placeholder-[var(--muted)]"
                                    value={editingUser.nome || ''}
                                    onChange={(e) => setEditingUser({ ...editingUser, nome: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--muted)]">Role</label>
                                <select
                                    className="mt-1 block w-full rounded-lg border-[var(--border)] bg-[var(--surface-highlight)] text-[var(--foreground)] shadow-sm focus:border-[var(--primary)] focus:ring-[var(--primary)] sm:text-sm p-2.5 border transition-all"
                                    value={editingUser.role || 'vendedor'}
                                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                                >
                                    <option value="admin">Admin</option>
                                    <option value="operador">Operador</option>
                                    <option value="vendedor">Vendedor</option>
                                </select>
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
                                    disabled={isSaving}
                                    className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-bold text-black bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-all disabled:opacity-50"
                                >
                                    {isSaving ? 'Salvando...' : 'Salvar'}
                                </button>
                            </div>
                        </form>
                    )}
                </Modal>
            </main>
        </div>
    );
}

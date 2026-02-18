'use client';

import React, { useEffect, useState } from 'react';
import { usePermission } from '@/hooks/usePermission';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { DataTable } from '@/components/ui/DataTable';
import { dataService } from '@/services/dataService';
import { Edit2 } from 'lucide-react';
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
            <div className="flex h-screen bg-[#121212] text-[#FFE600] items-center justify-center">
                <div className="text-xl">Carregando...</div>
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
                const roleMap: Record<string, { label: string; className: string }> = {
                    admin: { label: 'ADMINISTRADOR', className: 'text-black drop-shadow-[0_0_5px_rgba(255,255,255,1)] font-extrabold' },
                    operador: { label: 'OPERADOR', className: 'text-blue-500 drop-shadow-[0_0_3px_rgba(59,130,246,0.8)]' },
                    vendedor: { label: 'VENDEDOR', className: 'text-green-500 drop-shadow-[0_0_3px_rgba(34,197,94,0.8)]' },
                };
                const config = roleMap[user.role] || { label: user.role, className: 'text-[#FFE600]' };
                return <span className={`font-bold ${config.className}`}>{config.label}</span>;
            }
        },
        {
            header: 'Ações',
            accessor: (user: any) => (
                <button
                    onClick={() => handleEditClick(user)}
                    className="text-[#FFE600] opacity-80 hover:text-[#FFE600] hover:opacity-100 transition-colors"
                >
                    <Edit2 size={18} />
                </button>
            )
        },
    ];

    return (
        <div className="flex h-screen bg-[#121212] text-[#FFE600]">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold neon-text">Controle de Usuários</h1>
                    <div className="flex space-x-4">
                        <button
                            onClick={handleLinkChatwoot}
                            className="bg-blue-600/20 border border-blue-500 text-blue-500 px-4 py-2 rounded-md hover:bg-blue-600/40 transition font-semibold"
                        >
                            Linkar Chatwoot
                        </button>
                    </div>
                </header>

                <div className="bg-[#1E1E1E] rounded-lg shadow-lg border border-[#333] p-6">
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
                                <label className="block text-sm font-medium text-[#FFE600]">Nome</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full rounded-md border-[#333] bg-[#121212] text-[#FFE600] shadow-sm focus:border-[#FFE600] focus:ring-[#FFE600] sm:text-sm p-2 border placeholder-yellow-900/50"
                                    value={editingUser.nome || ''}
                                    onChange={(e) => setEditingUser({ ...editingUser, nome: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#FFE600]">Role</label>
                                <select
                                    className="mt-1 block w-full rounded-md border-[#333] bg-[#121212] text-[#FFE600] shadow-sm focus:border-[#FFE600] focus:ring-[#FFE600] sm:text-sm p-2 border"
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
                                    className="px-4 py-2 border border-[#FFE600] rounded-md text-sm font-medium text-[#FFE600] hover:bg-yellow-600/20"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-[#FFE600] bg-yellow-600/20 hover:bg-yellow-600/40 disabled:opacity-50"
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

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Search } from 'lucide-react';

interface ClientSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    clients: any[];
    onSelect: (client: any) => void;
}

export const ClientSelectionModal: React.FC<ClientSelectionModalProps> = ({ isOpen, onClose, clients, onSelect }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Selecione um Cliente">
            <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar p-1">
                {clients.length === 0 ? (
                    <div className="text-center py-8 text-[var(--muted)]">
                        Nenhum cliente encontrado.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3">
                        {clients.map((client, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    onSelect(client);
                                    onClose();
                                }}
                                className="flex flex-col items-start p-4 rounded-xl border transition-all duration-200 group text-left relative overflow-hidden"
                                style={{
                                    background: 'var(--surface)',
                                    borderColor: 'var(--border)',
                                }}
                            >
                                {/* Hover Effect Background */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(212,175,55,0.1) 0%, rgba(212,175,55,0.05) 100%)',
                                    }}
                                />

                                {/* Border Hover Effect */}
                                <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-[#D4AF37] opacity-0 group-hover:opacity-50 transition-all duration-300 pointer-events-none" />

                                <div className="relative z-10 w-full">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider group-hover:text-[#D4AF37] transition-colors">
                                            Data e Hora
                                        </span>
                                    </div>
                                    <div className="text-sm font-medium text-[var(--foreground)] mb-3 group-hover:text-white transition-colors">
                                        {client['DATA E HORA'] || client['data_e_hora'] || '-'}
                                    </div>

                                    <div className="w-full h-px bg-[var(--border)] mb-3 group-hover:bg-[#D4AF37] group-hover:opacity-30 transition-colors" />

                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider group-hover:text-[#D4AF37] transition-colors">
                                            Produtos
                                        </span>
                                    </div>
                                    <div className="text-sm text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors line-clamp-2">
                                        {client['PRODUTOS'] || client['produtos'] || '-'}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <div className="mt-6 pt-4 border-t border-[var(--border)] flex justify-end">
                <span className="text-xs text-[var(--muted)]">
                    Mostrando {clients.length} resultado{clients.length !== 1 ? 's' : ''}
                </span>
            </div>
        </Modal>
    );
};

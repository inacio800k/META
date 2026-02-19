import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/contexts/ToastContext';

interface RegisterNumberModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const RegisterNumberModal: React.FC<RegisterNumberModalProps> = ({ isOpen, onClose }) => {
    const [idNumero, setIdNumero] = useState('');
    const [tokenTemp, setTokenTemp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { showToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('https://n8nnovo.levezaativa.site/webhook/0a1950a2-0d1f-4a7a-bd0d-78cf02717515/site_meta/registra_sessao', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id_numero: idNumero,
                    token_temp: tokenTemp,
                }),
            });

            if (response.ok) {
                showToast('Número registrado com sucesso!', 'success');
                onClose();
                setIdNumero('');
                setTokenTemp('');
            } else {
                showToast('Erro ao registrar número. Tente novamente.', 'error');
            }
        } catch (error) {
            console.error('Erro ao registrar número:', error);
            showToast('Erro ao registrar número. Verifique sua conexão.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Registrar Número">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="id_numero" className="block text-sm font-medium text-[var(--muted)] mb-1">
                        ID Número
                    </label>
                    <input
                        type="text"
                        id="id_numero"
                        value={idNumero}
                        onChange={(e) => setIdNumero(e.target.value)}
                        className="w-full bg-[var(--surface-highlight)] border border-[var(--border)] rounded-lg p-2.5 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all placeholder-[var(--muted)]"
                        placeholder="Digite o ID do número"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="token_temp" className="block text-sm font-medium text-[var(--muted)] mb-1">
                        Token Temporário
                    </label>
                    <input
                        type="text"
                        id="token_temp"
                        value={tokenTemp}
                        onChange={(e) => setTokenTemp(e.target.value)}
                        className="w-full bg-[var(--surface-highlight)] border border-[var(--border)] rounded-lg p-2.5 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all placeholder-[var(--muted)]"
                        placeholder="Digite o token temporário"
                        required
                    />
                </div>
                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`py-2.5 px-6 rounded-lg cursor-pointer font-bold ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        style={{ background: 'linear-gradient(145deg, #92700C 0%, #BF9B30 15%, #DBCA6E 35%, #FFEC8A 50%, #DBCA6E 65%, #BF9B30 85%, #92700C 100%)', color: '#1A1200', border: '1px solid rgba(255,236,138,0.3)', boxShadow: '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,250,220,0.4), inset 0 -1px 0 rgba(146,112,12,0.3)', textShadow: '0 1px 0 rgba(255,250,220,0.3)' }}
                    >
                        {isLoading ? 'Registrando...' : 'Confirmar'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

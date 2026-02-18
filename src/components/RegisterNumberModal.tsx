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
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="id_numero" className="block text-sm font-medium text-[#FFE600] mb-1">
                        ID Número
                    </label>
                    <input
                        type="text"
                        id="id_numero"
                        value={idNumero}
                        onChange={(e) => setIdNumero(e.target.value)}
                        className="w-full bg-[#121212] border border-[#333] rounded-md p-2 text-white focus:outline-none focus:border-[#FFE600]"
                        placeholder="Digite o ID do número"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="token_temp" className="block text-sm font-medium text-[#FFE600] mb-1">
                        Token Temporário
                    </label>
                    <input
                        type="text"
                        id="token_temp"
                        value={tokenTemp}
                        onChange={(e) => setTokenTemp(e.target.value)}
                        className="w-full bg-[#121212] border border-[#333] rounded-md p-2 text-white focus:outline-none focus:border-[#FFE600]"
                        placeholder="Digite o token temporário"
                        required
                    />
                </div>
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`bg-[#FFE600] text-black font-bold py-2 px-4 rounded-md hover:bg-[#FFE600]/80 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isLoading ? 'Registrando...' : 'Confirmar'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

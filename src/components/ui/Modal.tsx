import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    className?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#121212]/80 backdrop-blur-sm">
            <div className={`bg-[#1E1E1E] rounded-lg shadow-xl w-full overflow-hidden relative border border-[#333] ${className || 'max-w-md'}`}>
                <div className="flex justify-between items-center p-4 border-b border-[#333]">
                    <h3 className="text-lg font-semibold neon-text">{title}</h3>
                    <button onClick={onClose} className="text-[#FFE600] opacity-70 hover:opacity-100 hover:text-[#FFE600] transition-opacity">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-4 text-[#FFE600]">
                    {children}
                </div>
            </div>
        </div>
    );
};

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-all duration-300">
            <div className={`bg-[var(--surface)] rounded-xl shadow-2xl w-full overflow-hidden relative border border-[var(--border)] ${className || 'max-w-md'} animate-in fade-in zoom-in-95 duration-200`}>
                <div className="flex justify-between items-center p-5 border-b border-[var(--border)] bg-[var(--surface)]">
                    <h3 className="text-lg font-bold text-[var(--foreground)] tracking-tight">{title}</h3>
                    <button onClick={onClose} className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors p-1 rounded-full hover:bg-[var(--surface-highlight)]">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 text-[var(--foreground)]">
                    {children}
                </div>
            </div>
        </div>
    );
};

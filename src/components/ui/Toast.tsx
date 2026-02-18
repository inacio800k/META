'use client';
import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type?: ToastType;
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
}

export function Toast({ message, type = 'info', isVisible, onClose, duration = 3000 }: ToastProps) {
    const [show, setShow] = useState(isVisible);

    useEffect(() => {
        setShow(isVisible);
        if (isVisible) {
            const timer = setTimeout(() => {
                setShow(false);
                setTimeout(onClose, 300); // Wait for fade out animation
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    if (!isVisible && !show) return null;

    const bgColors = {
        success: 'bg-green-600/90',
        error: 'bg-red-600/90',
        info: 'bg-blue-600/90'
    };

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-white" />,
        error: <AlertCircle className="w-5 h-5 text-white" />,
        info: <Info className="w-5 h-5 text-white" />
    };

    return (
        <div
            className={`fixed top-4 right-4 z-50 flex items-center p-4 mb-4 rounded-lg shadow-lg border border-white/10 backdrop-blur-sm transition-all duration-300 ease-in-out transform ${show ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'} ${bgColors[type]}`}
            role="alert"
        >
            <div className="flex items-center">
                {icons[type]}
                <div className="ml-3 text-sm font-medium text-white break-words max-w-xs">
                    {message}
                </div>
                <button
                    type="button"
                    className="ml-4 -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex items-center justify-center h-8 w-8 text-white hover:text-gray-200 hover:bg-white/20 focus:ring-2 focus:ring-gray-300 transition-colors"
                    onClick={() => setShow(false)}
                    aria-label="Close"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { XIcon } from './Icons';

interface ModalProps {
    onClose: () => void;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ onClose, children }) => {
    
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);
    
    return ReactDOM.createPortal(
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50"
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 w-full max-w-lg m-4 relative"
            >
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors" aria-label="Close modal">
                    <XIcon />
                </button>
                {children}
            </div>
        </div>,
        document.body
    );
};

export default Modal;
import React, { useEffect } from 'react';
import type { DisplayData } from '../types';
import { PROVINCE_COLORS } from '../constants';

interface AnecdoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: DisplayData | null;
}

export const AnecdoteModal: React.FC<AnecdoteModalProps> = ({ isOpen, onClose, data }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !data) {
    return null;
  }

  const { comune, aneddotoApprofondito, sources } = data;
  const provinceColors = PROVINCE_COLORS[comune.provincia] || { bg: 'bg-gray-100', text: 'text-gray-800' };
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in-fast"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="anecdote-title"
    >
      <div 
        className="bg-gray-800 text-white rounded-2xl shadow-xl w-full max-w-lg p-6 md:p-8 relative transform transition-all animate-modal-in border border-gray-700"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Chiudi modale"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 id="anecdote-title" className={`text-2xl font-bold ${provinceColors.text} mb-1`}>
          {comune.nome}
        </h3>
        <p className="text-gray-400 mb-4 text-sm">Approfondimento</p>
        
        <p className="text-gray-200 mb-6 whitespace-pre-wrap leading-relaxed">{aneddotoApprofondito}</p>
        
        <div className="mt-6 pt-4 border-t border-gray-700">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-3">Fonti Web</h4>
          {sources && sources.length > 0 ? (
            <ul className="space-y-2 max-h-32 overflow-y-auto pr-2">
              {sources.map((source, index) => (
                <li key={`${source.uri}-${index}`}>
                  <a
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-300 hover:text-indigo-200 hover:underline break-words group inline-flex items-center w-full text-sm"
                    title={source.title}
                  >
                    <span className="truncate">{source.title || new URL(source.uri).hostname}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 ml-1.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 italic">
              Nessuna fonte web trovata per questa generazione.
            </p>
          )}
        </div>

      </div>
       <style>
        {`
        @keyframes fade-in-fast {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes modal-in {
            from { opacity: 0; transform: scale(0.95) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fade-in-fast {
            animation: fade-in-fast 0.2s ease-out forwards;
        }
        .animate-modal-in {
            animation: modal-in 0.3s ease-out forwards;
        }
        `}
    </style>
    </div>
  );
};
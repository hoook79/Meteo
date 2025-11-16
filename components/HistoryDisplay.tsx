
import React, { useState, useEffect } from 'react';
import type { DisplayData } from '../types';
import { PROVINCE_COLORS } from '../constants';

interface HistoryDisplayProps {
    history: DisplayData[];
    onHistoryItemClick: (item: DisplayData) => void;
}

export const HistoryDisplay: React.FC<HistoryDisplayProps> = ({ history, onHistoryItemClick }) => {
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 5;
    const totalPages = Math.ceil(history.length / itemsPerPage);

    useEffect(() => {
        // Quando la cronologia cambia (es. viene aggiunto un elemento),
        // resetta alla prima pagina per mostrare il nuovo elemento.
        setCurrentPage(0);
    }, [history.length]);


    if (history.length === 0) {
        return null;
    }
    
    const paginatedHistory = history.slice(
        currentPage * itemsPerPage,
        (currentPage + 1) * itemsPerPage
    );

    const goToPrevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 0));
    };

    const goToNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages - 1));
    };

    return (
        <div className="w-full max-w-md">
            <h3 className="text-center text-sm font-semibold uppercase tracking-wider text-white/50 mb-3">
                Ultime Località Generate
            </h3>
            <ul className="space-y-2 min-h-[440px]">
                {paginatedHistory.map((item, index) => {
                    const provinceColors = PROVINCE_COLORS[item.comune.provincia] || { bg: 'bg-gray-200', text: 'text-gray-800' };
                    const generationDate = new Date(item.timestamp);
                    const formattedDateTime = new Intl.DateTimeFormat('it-IT', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    }).format(generationDate);

                    return (
                        <li 
                            key={`${item.comune.nome}-${item.timestamp}`} 
                            className="transition-all duration-300 animate-fade-in"
                            style={{ animationFillMode: 'backwards', animationDelay: `${index * 100}ms` }}
                        >
                            <button
                                onClick={() => onHistoryItemClick(item)}
                                className="w-full text-left bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 flex flex-col transition-colors duration-200 hover:bg-gray-700/70 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <div className="w-full flex items-center justify-between">
                                    <div className="flex items-center overflow-hidden mr-4">
                                        <span 
                                          className={`w-3 h-3 rounded-full mr-3 flex-shrink-0 ${provinceColors.bg.replace('bg-', 'bg-').replace('-100', '-400')}`} 
                                          title={item.comune.provincia}
                                        ></span>
                                        <div className="truncate">
                                            <p className="font-semibold text-white/90 truncate" title={`${item.comune.nome} (${item.comune.provincia})`}>
                                                {item.comune.nome} <span className="text-white/60 font-normal">({item.comune.sigla})</span>
                                            </p>
                                            <div className="flex items-center">
                                                <p className="text-xs text-white/60 truncate" title={`Generato il: ${formattedDateTime}`}>
                                                    {formattedDateTime}
                                                </p>
                                                {item.generationType === 'manual_refresh' && (
                                                    <div className="ml-2 flex-shrink-0" title="Meteo aggiornato manualmente">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        {item.weather ? (
                                            <>
                                                <p className="font-semibold text-white/90 whitespace-nowrap">{Math.round(item.weather.temperatura)}°C</p>
                                                <p className="text-xs text-white/60 capitalize truncate">{item.weather.statoCielo}</p>
                                            </>
                                        ) : (
                                            <p className="font-semibold text-white/70 whitespace-nowrap text-xs">Meteo N/A</p>
                                        )}
                                    </div>
                                </div>
                                {item.descrizione && (
                                    <div className="w-full mt-2 pt-2 border-t border-gray-700/50">
                                        <p className="text-xs text-white/70 italic truncate" title={item.descrizione}>
                                            "{item.descrizione}"
                                        </p>
                                    </div>
                                )}
                            </button>
                        </li>
                    );
                })}
            </ul>
             {totalPages > 1 && (
                <div className="flex items-center justify-center mt-4 text-white/70">
                    <button
                        onClick={goToPrevPage}
                        disabled={currentPage === 0}
                        className="p-2 rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        aria-label="Pagina precedente"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <span className="text-sm font-semibold mx-4 tabular-nums">
                        Pagina {currentPage + 1} di {totalPages}
                    </span>
                    <button
                        onClick={goToNextPage}
                        disabled={currentPage >= totalPages - 1}
                        className="p-2 rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        aria-label="Pagina successiva"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            )}
            <style>
                {`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
                `}
            </style>
        </div>
    );
};
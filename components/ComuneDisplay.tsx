import React from 'react';
import type { DisplayData, Provincia } from '../types';
import { PROVINCE_COLORS } from '../constants';
import { WeatherIcon } from './WeatherIcon';

interface ComuneDisplayProps {
  data: DisplayData | null;
  loading: boolean;
  error: string | null;
  onAnecdoteClick: () => void;
  isHistorical: boolean;
  onRefreshWeather: (historicalData: DisplayData) => void;
}

const SkeletonLoader: React.FC = () => (
    <div className="w-full max-w-md mx-auto bg-gray-700/50 backdrop-blur-md rounded-2xl shadow-lg p-8 animate-pulse">
        <div className="h-6 bg-gray-500/50 rounded-md w-1/4 mb-4"></div>
        <div className="h-10 bg-gray-500/50 rounded-md w-3/4 mb-2"></div>
        <div className="h-5 bg-gray-500/50 rounded-md w-full mb-8"></div>
        <div className="flex justify-around items-center">
            <div className="flex flex-col items-center w-1/2 pr-4">
                <div className="h-6 bg-gray-500/50 rounded-md w-2/3 mb-2"></div>
                <div className="h-12 bg-gray-500/50 rounded-md w-1/2"></div>
            </div>
            <div className="flex flex-col items-center w-1/2 pl-4">
                <div className="h-6 bg-gray-500/50 rounded-md w-2/3 mb-2"></div>
                <div className="h-12 w-12 bg-gray-500/50 rounded-full my-1"></div>
                <div className="h-4 bg-gray-500/50 rounded-md w-full"></div>
            </div>
        </div>
        <div className="mt-6 pt-4 border-t border-gray-500/50">
             <div className="h-4 bg-gray-500/50 rounded-md w-1/4 mb-3"></div>
             <div className="h-4 bg-gray-500/50 rounded-md w-full mb-2"></div>
             <div className="h-4 bg-gray-500/50 rounded-md w-2/3"></div>
        </div>
    </div>
);


export const ComuneDisplay: React.FC<ComuneDisplayProps> = ({ data, loading, error, onAnecdoteClick, isHistorical, onRefreshWeather }) => {
  if (loading) {
    return <SkeletonLoader />;
  }

  if (error) {
    return (
      <div className="w-full max-w-md mx-auto bg-red-900/50 backdrop-blur-md rounded-2xl shadow-lg p-8 text-white text-center border border-red-700">
        <h3 className="text-xl font-semibold mb-2">Oops! Qualcosa è andato storto.</h3>
        <p className="text-red-200">{error}</p>
      </div>
    );
  }
  
  if (!data) {
     return (
        <div className="w-full max-w-md mx-auto bg-gray-700/20 backdrop-blur-md rounded-2xl shadow-lg p-8 text-center text-white/80 border border-gray-600">
            <h3 className="text-2xl font-bold mb-2">Pronto a scoprire la Toscana?</h3>
            <p className="mb-4">Clicca il pulsante per generare un comune casuale, il suo meteo e una breve descrizione.</p>
        </div>
     );
  }

  const { comune, weather, descrizione, aneddotoApprofondito, timestamp } = data;
  const provinceColors = PROVINCE_COLORS[comune.provincia] || { bg: 'bg-gray-100', text: 'text-gray-800' };

  const formattedDateTime = new Intl.DateTimeFormat('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(timestamp));

  return (
    <div className={`w-full max-w-md mx-auto ${provinceColors.bg} rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 ease-in-out`}>
        {isHistorical && (
            <div className="bg-yellow-900/50 text-yellow-200 text-xs p-3 text-center space-y-2">
                <div className="font-bold text-sm flex items-center justify-center gap-x-2">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    METEO NON AGGIORNATO
                </div>
                <div className="text-yellow-300/80 text-[11px]">(Dati del {formattedDateTime})</div>
                 <button 
                    onClick={() => onRefreshWeather(data)}
                    className="bg-yellow-400/20 hover:bg-yellow-400/40 text-yellow-200 font-bold py-1 px-3 rounded-full text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                    Aggiorna Meteo
                </button>
            </div>
        )}
        <div className="p-8">
            <div className={`inline-block px-3 py-1 text-sm font-semibold ${provinceColors.text} bg-white/60 rounded-full mb-4`}>
                {comune.provincia} ({comune.sigla})
            </div>
            <h2 className={`text-4xl lg:text-5xl font-bold ${provinceColors.text} mb-2 break-words`}>{comune.nome}</h2>

            {!isHistorical && (
                <div className={`text-center text-xs ${provinceColors.text} opacity-70 -mt-1 mb-4`}>
                    Dati del {formattedDateTime}
                </div>
            )}

            <button
              onClick={onAnecdoteClick}
              disabled={!aneddotoApprofondito}
              className={`group w-full text-lg italic ${provinceColors.text} opacity-90 mb-6 text-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-current rounded-sm disabled:cursor-not-allowed disabled:opacity-70`}
              aria-label={`Approfondisci: ${descrizione}`}
            >
              <span className="group-hover:underline disabled:no-underline">"{descrizione}"</span>
              {aneddotoApprofondito && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block ml-1 opacity-60 group-hover:opacity-100 transition-opacity" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            
            <div className="flex justify-around items-center text-center border-t border-white/20 pt-6">
                 {weather ? (
                    <>
                        <div className={`flex flex-col items-center ${provinceColors.text} w-1/2 pr-2`}>
                            <span className="text-sm font-medium opacity-80 uppercase tracking-wider">Temperatura</span>
                            <p className="text-6xl font-light tracking-tighter">{Math.round(weather.temperatura)}<span className="opacity-70">°C</span></p>
                        </div>
                        <div className={`flex flex-col items-center ${provinceColors.text} w-1/2 pl-2`}>
                            <span className="text-sm font-medium opacity-80 uppercase tracking-wider">Cielo</span>
                            <WeatherIcon weatherDescription={weather.statoCielo} className={`w-12 h-12 my-2 ${provinceColors.text}`} />
                            <p className="text-sm font-semibold capitalize h-10 flex items-center justify-center text-center">{weather.statoCielo}</p>
                        </div>
                    </>
                ) : (
                    <div className={`flex flex-col items-center ${provinceColors.text} w-full`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 opacity-70 mb-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm font-semibold opacity-90">Dati meteo non disponibili</p>
                    </div>
                )}
            </div>

        </div>
    </div>
  );
};
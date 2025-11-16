import React, { useState, useCallback, useEffect } from 'react';
import { getWeatherForComune } from '../services/geminiService';
import type { ComuneInfo, DisplayData, Provincia } from '../types';
import { COMUNI_PER_PROVINCIA, PROVINCE_CYCLE } from '../constants';
import { ComuneDisplay } from './ComuneDisplay';
import { DigitalClock } from './DigitalClock';
import { HistoryDisplay } from './HistoryDisplay';
import { AnecdoteModal } from './AnecdoteModal';
import { subscribeToHistory, addHistoryItem } from '../services/historyService';
import { ProvinceSelector } from './ProvinceSelector';


// Funzione helper per calcolare la prossima provincia in modo intelligente
const calculateNextSmartProvince = (currentHistory: DisplayData[]): Provincia => {
    // Evita le ultime 3-5 province più recenti per incoraggiare la varietà
    const recentProvinces = [...new Set(currentHistory.slice(0, Math.min(5, PROVINCE_CYCLE.length - 2)).map(h => h.comune.provincia))];
    let candidateProvinces = PROVINCE_CYCLE.filter(p => !recentProvinces.includes(p));
    
    // Se tutte le province sono state visitate di recente, resetta il pool
    if (candidateProvinces.length === 0) {
        candidateProvinces = [...PROVINCE_CYCLE];
    }

    // Seleziona una provincia casuale tra le candidate
    return candidateProvinces[Math.floor(Math.random() * candidateProvinces.length)];
};


export const MainApp: React.FC = () => {
    const [displayData, setDisplayData] = useState<DisplayData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    // Stato gestito da Firebase
    const [history, setHistory] = useState<DisplayData[]>([]);
    
    // Stato per la selezione della provincia (manuale o automatica)
    const [nextProvince, setNextProvince] = useState<Provincia>(PROVINCE_CYCLE[0]);
    
    // Stato locale del componente
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isViewingHistory, setIsViewingHistory] = useState<boolean>(false);

    // Effetto per sottoscriversi alla cronologia di Firestore
    useEffect(() => {
        const unsubscribe = subscribeToHistory((newHistory) => {
            setHistory(newHistory);
        });

        // Cleanup della sottoscrizione quando il componente viene smontato
        return () => unsubscribe();
    }, []);

    // Effetto per impostare la prima provincia "intelligente" una volta caricata la cronologia
    useEffect(() => {
        if (history.length > 0) {
             setNextProvince(calculateNextSmartProvince(history));
        }
    }, [history.length > 0]);


    const handleOpenModal = useCallback(() => {
        if (displayData?.aneddotoApprofondito) {
            setIsModalOpen(true);
        }
    }, [displayData]);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
    }, []);
    
    const handleHistoryClick = useCallback((item: DisplayData) => {
        setDisplayData(item);
        setIsViewingHistory(true);
        setError(null);
        setLoading(false);
    }, []);
    
    const handleProvinceChange = useCallback((province: Provincia) => {
        setNextProvince(province);
    }, []);

    const handleRefreshWeather = useCallback(async (historicalData: DisplayData) => {
        setLoading(true);
        setError(null);
        setIsViewingHistory(false); // Stiamo recuperando dati aggiornati

        try {
            // Recupera i dati aggiornati, ma conserva l'aneddoto originale.
            const { weather, sources } = await getWeatherForComune(historicalData.comune.nome, historicalData.comune.provincia);

            // Crea l'oggetto da salvare su Firestore (senza timestamp)
            const newDisplayDataForFirestore: Omit<DisplayData, 'timestamp'> = { 
                comune: historicalData.comune, 
                weather, 
                sources, 
                descrizione: historicalData.descrizione, 
                aneddotoApprofondito: historicalData.aneddotoApprofondito,
                generationType: 'manual_refresh'
            };

            // Salva su Firestore, che aggiornerà la cronologia tramite onSnapshot
            await addHistoryItem(newDisplayDataForFirestore);
            
            // Aggiorna la UI immediatamente con un timestamp locale per reattività
            const optimisticDisplayData: DisplayData = {
                ...newDisplayDataForFirestore,
                timestamp: new Date().toISOString()
            };
            setDisplayData(optimisticDisplayData);

        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Si è verificato un errore sconosciuto durante l'aggiornamento.");
            }
            setDisplayData(null); 
        } finally {
            setLoading(false);
        }
    }, []);

    const handleGenerate = useCallback(async () => {
        setLoading(true);
        setError(null);
        setIsViewingHistory(false);
        
        const selectedProvince = nextProvince; // Usa la provincia dallo stato (manuale o automatica)
        
        try {
            // Seleziona un comune dalla provincia scelta, dando priorità a quelli visti meno di recente
            const allComuniInProvince = COMUNI_PER_PROVINCIA[selectedProvince];

            const lastAppearanceMap = new Map<string, number>();
            history.forEach((h, index) => {
                if (h.comune.provincia === selectedProvince && !lastAppearanceMap.has(h.comune.nome)) {
                    lastAppearanceMap.set(h.comune.nome, index);
                }
            });

            const sortedComuni = [...allComuniInProvince].sort((a, b) => {
                const lastA = lastAppearanceMap.get(a.nome) ?? -1; // -1 se mai visto
                const lastB = lastAppearanceMap.get(b.nome) ?? -1;
                
                if (lastA === -1 && lastB !== -1) return -1; // 'a' è preferito (non visto)
                if (lastB === -1 && lastA !== -1) return 1;  // 'b' è preferito (non visto)
                
                return lastA - lastB; // Preferisce quello visto più tempo fa (indice più alto)
            });
            
            // Seleziona casualmente da un pool dei comuni meno recenti per aggiungere varietà
            const selectionPoolSize = Math.max(1, Math.floor(sortedComuni.length * 0.25)); // Prendi il 25% meno recente
            const selectionPool = sortedComuni.slice(0, selectionPoolSize);
            const selectedComuneData = selectionPool[Math.floor(Math.random() * selectionPool.length)];
            
            const comuneInfo: ComuneInfo = {
                nome: selectedComuneData.nome,
                provincia: selectedProvince,
                sigla: selectedComuneData.sigla
            };
            
            const { weather, sources, descrizione, aneddotoApprofondito } = await getWeatherForComune(comuneInfo.nome, comuneInfo.provincia);

            const newDisplayDataForFirestore: Omit<DisplayData, 'timestamp'> = { 
                comune: comuneInfo, 
                weather, 
                sources, 
                descrizione, 
                aneddotoApprofondito,
                generationType: 'auto' 
            };
            
            await addHistoryItem(newDisplayDataForFirestore);
            
            const optimisticDisplayData: DisplayData = {
                 ...newDisplayDataForFirestore,
                 timestamp: new Date().toISOString()
            };

            setDisplayData(optimisticDisplayData);

            // Dopo una generazione riuscita, calcola la prossima provincia intelligente per il selettore
            const updatedHistory = [optimisticDisplayData, ...history];
            setNextProvince(calculateNextSmartProvince(updatedHistory));

        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Si è verificato un errore sconosciuto.");
            }
            setDisplayData(null);
        } finally {
            setLoading(false);
        }
    }, [history, nextProvince]);

    return (
        <main className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-slate-800 to-black flex flex-col items-center p-4 pt-10 pb-10 gap-y-6 selection:bg-indigo-500 selection:text-white">
            
            <header className="text-center">
                 <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-2">
                    RADIO TOSCANA SEGNALE ORARIO
                </h1>
                <p className="text-md text-white/70 max-w-prose">
                    Comuni random della Toscana e relativo meteo
                </p>
            </header>

            <DigitalClock />
            
            <div className="w-full max-w-md flex flex-col items-center justify-center text-center" style={{ minHeight: '420px' }}>
                <ComuneDisplay 
                    data={displayData} 
                    loading={loading} 
                    error={error}
                    onAnecdoteClick={handleOpenModal}
                    isHistorical={isViewingHistory}
                    onRefreshWeather={handleRefreshWeather}
                />
            </div>
            
            <div className="w-full max-w-md bg-black/20 p-4 rounded-2xl border border-white/10 shadow-lg">
              <div className="flex flex-col items-center gap-y-3">
                <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full px-8 py-4 bg-indigo-600 text-white font-bold rounded-full shadow-2xl shadow-indigo-600/30 hover:bg-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 disabled:bg-indigo-400 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-100"
                >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generazione...
                      </div>
                    ) : 'Scopri un Nuovo Comune'}
                </button>
                <ProvinceSelector 
                    currentProvince={nextProvince}
                    onProvinceChange={handleProvinceChange}
                    disabled={loading}
                />
              </div>
            </div>

            <HistoryDisplay history={history} onHistoryItemClick={handleHistoryClick} />
            
            <AnecdoteModal 
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                data={displayData}
            />

        </main>
    );
};
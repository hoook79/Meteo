import {
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    Timestamp,
    serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { db } from './firebase';
import type { DisplayData } from '../types';

const CITIES_COLLECTION = 'cities';

// Tipo per i dati del documento Firestore, dove il timestamp è un oggetto Timestamp di Firebase
interface CityDoc extends Omit<DisplayData, 'timestamp'> {
    timestamp: Timestamp;
}

/**
 * Si sottoscrive agli aggiornamenti in tempo reale della collezione 'cities' su Firestore.
 * @param callback La funzione da chiamare con l'array aggiornato della cronologia.
 * @returns Una funzione per annullare la sottoscrizione.
 */
export const subscribeToHistory = (callback: (history: DisplayData[]) => void) => {
    const q = query(collection(db, CITIES_COLLECTION), orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const historyData: DisplayData[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data() as CityDoc;
            // Converte in modo sicuro i dati di Firestore nel tipo DisplayData atteso dall'UI
            historyData.push({
                ...data,
                // Fornisce valori di default per robustezza
                comune: data.comune || { nome: 'Sconosciuto', provincia: 'Sconosciuta' as any, sigla: '??' },
                descrizione: data.descrizione || '',
                aneddotoApprofondito: data.aneddotoApprofondito || '',
                weather: data.weather || null,
                sources: data.sources || [],
                // Converte il Timestamp di Firestore in una stringa ISO, gestendo casi nulli
                timestamp: data.timestamp ? data.timestamp.toDate().toISOString() : new Date().toISOString(),
            });
        });
        callback(historyData);
    }, (error) => {
        console.error("Errore durante l'ascolto della cronologia:", error);
        // Puoi gestire l'errore qui, ad esempio mostrando un messaggio all'utente
    });

    return unsubscribe;
};

/**
 * Aggiunge un nuovo elemento alla cronologia su Firestore.
 * @param item L'oggetto DisplayData (senza timestamp) da aggiungere.
 */
export const addHistoryItem = async (item: Omit<DisplayData, 'timestamp'>) => {
    try {
        await addDoc(collection(db, CITIES_COLLECTION), {
            ...item,
            timestamp: serverTimestamp(), // Usa il timestamp del server per coerenza
        });
    } catch (error) {
        console.error("Errore durante l'aggiunta del documento a Firestore: ", error);
        throw new Error("Impossibile salvare il comune nella cronologia.");
    }
};

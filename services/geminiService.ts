// FIX: Import `GenerateContentResponse` to properly type the Gemini API response.
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { WeatherInfo, Source } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const parseResponse = (responseText: string): { weather: WeatherInfo | null; descrizione: string; aneddotoApprofondito: string; } => {
    let jsonString = responseText;

    // The model can sometimes wrap the JSON in markdown backticks. Let's remove them.
    const markdownMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (markdownMatch) {
        jsonString = markdownMatch[1];
    }

    // Also, find the first '{' and last '}' to be more robust against leading/trailing text.
    const firstBrace = jsonString.indexOf('{');
    const lastBrace = jsonString.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
         throw new Error("L'API non ha fornito una risposta contenente un oggetto JSON valido.");
    }
    jsonString = jsonString.substring(firstBrace, lastBrace + 1);

    try {
        const data = JSON.parse(jsonString);

        // Check for the required 'cultura' object and its properties.
        if (!data.cultura || typeof data.cultura.descrizione !== 'string' || typeof data.cultura.aneddotoApprofondito !== 'string') {
            throw new Error("I dati culturali nel JSON di risposta sono incompleti o malformati.");
        }

        const { cultura } = data;
        let weather: WeatherInfo | null = null;
        
        // Check for 'meteo' object and its properties. This part is optional.
        if (data.meteo && typeof data.meteo.temperatura === 'number' && typeof data.meteo.statoCielo === 'string') {
            weather = {
                temperatura: data.meteo.temperatura,
                statoCielo: data.meteo.statoCielo,
            };
        }

        return { 
            weather, 
            descrizione: cultura.descrizione, 
            aneddotoApprofondito: cultura.aneddotoApprofondito 
        };

    } catch (e) {
        console.error("Failed to parse JSON from response:", jsonString, e);
        if (e instanceof Error) {
            throw new Error(`L'API ha fornito una stringa JSON non valida: ${e.message}`);
        }
        throw new Error("L'API ha fornito una stringa JSON non valida.");
    }
};


export const getWeatherForComune = async (
  nomeComune: string, 
  nomeProvincia: string
): Promise<{ weather: WeatherInfo | null; sources: Source[]; descrizione: string; aneddotoApprofondito: string; }> => {
  try {
    const prompt = `**RUOLO**: Sei un'API di estrazione dati specializzata in meteo e cultura per i comuni italiani.
**OBIETTIVO**: Fornire dati meteo attuali e una breve curiosità culturale per "${nomeComune}" (${nomeProvincia}) in formato JSON.

---
**TASK 1: METEO (PRECISIONE E AFFIDABILITÀ)**

1.  **FONTE PRIMARIA**: La tua fonte **prioritaria** per i dati meteo è quella ufficiale di Google (la scheda meteo che appare nei risultati di ricerca). Sforzati di trovare e usare questa.
2.  **STRATEGIA DI RICERCA FLESSIBILE**: Il tuo compito è trovare questi dati. Prova diverse query di ricerca se necessario. Esempi: \`meteo ${nomeComune}\`, \`tempo a ${nomeComune} ${nomeProvincia}\`. L'obiettivo è individuare la fonte ufficiale di Google.
3.  **PIANO B (SE FONTE GOOGLE NON DISPONIBILE)**: Se, dopo un'accurata ricerca, non riesci a trovare la fonte ufficiale di Google per questo comune, sei autorizzato a usare la tua conoscenza generale o altre fonti metereologiche altamente affidabili (es. ilmeteo.it, 3bmeteo) per fornire una stima realistica. In questo caso, è accettabile che i dati non siano in tempo reale, ma devono essere plausibili.
4.  **ESTRAZIONE DATI**:
    *   **Temperatura**: Riporta il valore numerico esatto. Non arrotondare.
    *   **Stato Cielo**: Riporta la descrizione testuale. **DEVE** essere in italiano. Se la trovi in inglese, traducila.
5.  **CASO DI FALLIMENTO ESTREMO**: Solo se non riesci a trovare alcuna informazione meteo affidabile da nessuna fonte, imposta il campo "meteo" a \`null\`.

---
**TASK 2: CULTURA (FATTO "WOW")**

1.  **OBIETTIVO**: Scovare un aneddoto o una curiosità **verificata e sorprendente** su "${nomeComune}" che la maggior parte delle persone non conosce. L'obiettivo è generare un "effetto wow" che faccia dire "non lo sapevo!".
2.  **VERIFICA GEOGRAFICA CRITICA**: Prima di scegliere un aneddoto, devi **OBBLIGATORIAMENTE** verificare che il fatto, l'evento, o il personaggio menzionato sia **inequivocabilmente legato** al comune di "${nomeComune}" in provincia di "${nomeProvincia}". Esistono molti comuni con nomi simili in Italia (omonimie). È un errore gravissimo associare a un comune un fatto avvenuto in un'altra località omonima. **ESEMPIO DI ERRORE DA EVITARE**: l'Autogrill di Cantagallo si trova vicino a Bologna (BO), non a Cantagallo in provincia di Prato (PO). Ignora categoricamente qualsiasi informazione che non puoi associare con certezza al comune corretto. La tua credibilità dipende da questa verifica.
3.  **FONTE**: Utilizza la pagina Wikipedia in italiano di "${nomeComune}" (${nomeProvincia}) come punto di partenza, ma approfondisci con la ricerca Google per verificare e arricchire il fatto, tenendo sempre presente la verifica geografica.
4.  **COSA CERCARE**:
    *   **Eventi storici unici**: Una battaglia dimenticata, un trattato firmato lì, un evento strano.
    *   **Personaggi illustri**: Luogo di nascita o vita di personaggi famosi (artisti, scienziati) e un fatto poco noto su di loro legato al luogo.
    *   **Tradizioni e leggende**: Feste uniche, miti locali, leggende popolari.
    *   **Record o primati**: "È il primo posto in Italia dove...", "L'unico comune che ha...".
    *   **Origine del nome**: Se il nome del comune ha una storia particolare o divertente.
    *   **Prodotti tipici o invenzioni**: Se un piatto, un vino o un oggetto famoso è stato inventato lì.
5.  **COSA EVITARE (ASSOLUTAMENTE PROIBITO)**:
    *   Dati demografici (es. "Comune di 10.000 abitanti").
    *   Descrizioni geografiche banali (es. "Situato sul fiume...").
    *   Informazioni amministrative (es. "Fa parte della comunità montana...").
    *   Frasi generiche e noiose come "Comune italiano in provincia di...".
6.  **DATI DA ESTRARRE**:
    *   **descrizione**: Una "frase-gancio" di massimo 15 parole che introduca la curiosità in modo intrigante, senza svelare tutto.
    *   **aneddotoApprofondito**: L'aneddoto completo, spiegato in 30-60 parole. Deve essere chiaro, conciso e mantenere la promessa della descrizione.

---
**FORMATO JSON DI OUTPUT (OBBLIGATORIO)**
La tua risposta deve essere solo e soltanto un oggetto JSON valido, senza commenti o markdown.

\`\`\`json
{
  "meteo": {
    "temperatura": <numero>,
    "statoCielo": "<stringa in italiano>"
  },
  "cultura": {
    "descrizione": "<stringa>",
    "aneddotoApprofondito": "<stringa>"
  }
}
\`\`\`
---
**VERIFICA FINALE**: Prima di rispondere, assicurati che i dati meteo siano una copia 1:1 della fonte ufficiale Google, che la verifica geografica per la cultura sia stata superata e che il formato JSON sia perfetto.

Esegui ora per "${nomeComune}".`;

    // FIX: Explicitly type the `response` object. This resolves an "Untyped function calls may not accept type arguments" error
    // on the `reduce` call below by ensuring that `groundingChunks` is correctly typed.
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }, { googleMaps: {} }],
        temperature: 0,
      },
    });

    const responseText = response.text;
    const { weather, descrizione, aneddotoApprofondito } = parseResponse(responseText);
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    // FIX: The generic type argument on `reduce` was causing an error because the type of `groundingChunks`
    // was not being inferred correctly, making `reduce` an untyped function.
    // By removing the generic and casting the initial value `[]` to `Source[]`,
    // TypeScript can correctly infer the types for the accumulator and the return value.
    const allSources = groundingChunks.reduce((acc, chunk) => {
      if (chunk.web?.uri) {
        acc.push({ uri: chunk.web.uri, title: chunk.web.title || chunk.web.uri });
      }
      if (chunk.maps?.uri) {
        acc.push({ uri: chunk.maps.uri, title: chunk.maps.title || chunk.maps.uri });
      }
      return acc;
    }, [] as Source[]);

    const sources = allSources.filter((source, index, self) =>
      index === self.findIndex((s) => s.uri === source.uri)
    );

    return { weather, sources, descrizione, aneddotoApprofondito };

  } catch (error) {
    console.error("Errore durante la chiamata all'API Gemini o parsing:", error);
    
    if (error instanceof Error && error.message) {
        try {
            // The Gemini library often stringifies the JSON error into the message.
            const errorData = JSON.parse(error.message);
            if (errorData.error && errorData.error.message) {
                 if (errorData.error.code === 500) {
                    throw new Error(`Si è verificato un errore temporaneo del server (${errorData.error.status}). Per favore, riprova tra qualche istante.`);
                 }
                 throw new Error(`Errore API: ${errorData.error.message}`);
            }
        } catch (e) {
            // The message is not JSON, rethrow with a clearer prefix.
            throw new Error(`Impossibile recuperare i dati: ${error.message}`);
        }
    }

    // Fallback for non-Error instances or other issues.
    throw new Error("Impossibile recuperare i dati. L'API potrebbe essere non disponibile o la richiesta non valida.");
  }
};
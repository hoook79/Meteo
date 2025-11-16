export enum Provincia {
  Arezzo = 'Arezzo',
  Firenze = 'Firenze',
  Grosseto = 'Grosseto',
  Livorno = 'Livorno',
  Lucca = 'Lucca',
  MassaCarrara = 'Massa-Carrara',
  Pisa = 'Pisa',
  Pistoia = 'Pistoia',
  Prato = 'Prato',
  Siena = 'Siena',
}

export interface ComuneInfo {
  nome: string;
  provincia: Provincia;
  sigla: string;
}

export interface WeatherInfo {
  temperatura: number;
  statoCielo: string;
}

export interface Source {
  uri: string;
  title: string;
}

export type GenerationType = 'auto' | 'manual_refresh';

export interface DisplayData {
  comune: ComuneInfo;
  weather: WeatherInfo | null;
  sources: Source[];
  descrizione: string;
  aneddotoApprofondito: string;
  timestamp: string;
  generationType?: GenerationType;
}
export interface Ubicacion {
  lat: number;
  lon: number;
  country: string;
}

export interface Amenaza {
  id: string;
  timestamp: string;
  source: Ubicacion;
  target: Ubicacion;
  attackType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  color: [number, number, number];
}

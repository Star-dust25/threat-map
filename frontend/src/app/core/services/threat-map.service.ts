import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Amenaza } from '../models/threat.model';
import { ServicioWebSocket } from './websocket.service';

export interface EstadisticasAmenazas {
  mayoresAtacantes: { pais: string, porcentaje: number }[];
  mayoresAtacados: { pais: string, porcentaje: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class ServicioMapaAmenazas {
  private amenazasActivasSujeto = new BehaviorSubject<Amenaza[]>([]);
  private tiposAtaquePermitidosSujeto = new BehaviorSubject<Set<string>>(new Set(['DDoS', 'Malware', 'Phishing', 'Ransomware', 'SQLi', 'Brute Force']));
  
  public amenazasActivas$: Observable<Amenaza[]> = combineLatest([
    this.amenazasActivasSujeto,
    this.tiposAtaquePermitidosSujeto
  ]).pipe(
    map(([amenazas, permitidos]) => amenazas.filter(a => permitidos.has(a.attackType)))
  );

  public estadisticas$: Observable<EstadisticasAmenazas> = this.amenazasActivasSujeto.pipe(
    map(() => this.calcularEstadisticas())
  );
  
  private tiempoVidaMaximoAmenazaMs = 4000;
  private maximoHistorialEstadisticas = 100;
  private historialEstadisticas: Amenaza[] = [];

  constructor(private servicioWs: ServicioWebSocket) {
    this.servicioWs.mensajes$
      .pipe(
        filter((msg): msg is Amenaza => !!msg && !!msg.id)
      )
      .subscribe(amenaza => {
        const actual = this.amenazasActivasSujeto.value;
        this.amenazasActivasSujeto.next([...actual, amenaza]);
        
        this.historialEstadisticas.push(amenaza);
        if (this.historialEstadisticas.length > this.maximoHistorialEstadisticas) {
          this.historialEstadisticas.shift();
        }
      });

    setInterval(() => {
      const ahora = new Date().getTime();
      const actual = this.amenazasActivasSujeto.value;
      const filtrado = actual.filter(a => {
        const tiempoA = new Date(a.timestamp).getTime();
        return ahora - tiempoA < this.tiempoVidaMaximoAmenazaMs;
      });
      if (filtrado.length !== actual.length) {
        this.amenazasActivasSujeto.next(filtrado);
      }
    }, 500);
  }

  public establecerTiposAtaquePermitidos(tipos: Set<string>): void {
    this.tiposAtaquePermitidosSujeto.next(tipos);
  }
  
  public obtenerTiposAtaquePermitidos(): Set<string> {
    return this.tiposAtaquePermitidosSujeto.value;
  }

  private calcularEstadisticas(): EstadisticasAmenazas {
    const datos = this.historialEstadisticas;
    if (datos.length === 0) {
      return { mayoresAtacantes: [], mayoresAtacados: [] };
    }

    const mapaAtacantes = new Map<string, number>();
    const mapaAtacados = new Map<string, number>();

    datos.forEach(a => {
      mapaAtacantes.set(a.source.country, (mapaAtacantes.get(a.source.country) || 0) + 1);
      mapaAtacados.set(a.target.country, (mapaAtacados.get(a.target.country) || 0) + 1);
    });

    const aPorcentajesOrdenados = (m: Map<string, number>) => {
      return Array.from(m.entries())
        .map(([pais, cantidad]) => ({ pais, porcentaje: Math.round((cantidad / datos.length) * 100) }))
        .sort((a, b) => b.porcentaje - a.porcentaje)
        .slice(0, 5);
    };

    return {
      mayoresAtacantes: aPorcentajesOrdenados(mapaAtacantes),
      mayoresAtacados: aPorcentajesOrdenados(mapaAtacados)
    };
  }
}

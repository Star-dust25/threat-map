import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicioWebSocket, EstadoConexion } from './core/services/websocket.service';
import { ComponenteMapaAmenazas } from './features/map/threat-map/threat-map.component';
import { ComponenteIndicadorEstado } from './shared/components/status-indicator/status-indicator.component';
import { ComponenteTiposAtaque } from './shared/components/attack-types/attack-types.component';
import { ComponenteEstadisticasAmenazas } from './shared/components/threat-stats/threat-stats.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    ComponenteMapaAmenazas, 
    ComponenteIndicadorEstado, 
    ComponenteTiposAtaque, 
    ComponenteEstadisticasAmenazas
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  public estadoWs$: Observable<EstadoConexion>;

  constructor(private servicioWs: ServicioWebSocket) {
    this.estadoWs$ = this.servicioWs.estadoConexion$;
  }

  ngOnInit() {
    this.servicioWs.conectar('ws://localhost:8080/ws');
  }
}

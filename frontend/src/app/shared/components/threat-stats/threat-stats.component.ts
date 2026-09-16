import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicioMapaAmenazas } from '../../../core/services/threat-map.service';

@Component({
  selector: 'app-estadisticas-amenazas',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="panel" *ngIf="servicioAmenazas.estadisticas$ | async as estadisticas">
      <h3>INTERVALO ESTADÍSTICAS</h3>
      <div class="interval-select">
        <select>
          <option>En tiempo real (En vivo)</option>
        </select>
      </div>

      <div class="section">
        <h4>MAYORES ATACANTES</h4>
        <div class="stat-row" *ngFor="let est of estadisticas.mayoresAtacantes">
          <div class="stat-info">
            <span class="country">{{ est.pais }}</span>
            <span class="pct">{{ est.porcentaje }}%</span>
          </div>
          <div class="progress-bar">
            <div class="fill attackers" [style.width.%]="est.porcentaje"></div>
          </div>
        </div>
      </div>

      <div class="section">
        <h4>MÁS ATACADOS</h4>
        <div class="stat-row" *ngFor="let est of estadisticas.mayoresAtacados">
          <div class="stat-info">
            <span class="country">{{ est.pais }}</span>
            <span class="pct">{{ est.porcentaje }}%</span>
          </div>
          <div class="progress-bar">
            <div class="fill attacked" [style.width.%]="est.porcentaje"></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .panel {
      background: rgba(10, 15, 30, 0.85);
      border: 1px solid rgba(0, 229, 255, 0.2);
      border-radius: 8px;
      padding: 20px;
      width: 250px;
      color: #fff;
      font-family: 'Inter', sans-serif;
      backdrop-filter: blur(8px);
    }
    h3, h4 {
      color: #00e5ff;
      letter-spacing: 1px;
      margin: 0 0 10px 0;
    }
    h3 {
      font-size: 13px;
    }
    h4 {
      font-size: 12px;
      margin-top: 25px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 5px;
    }
    .interval-select select {
      background: transparent;
      color: #00e5ff;
      border: 1px solid rgba(0, 229, 255, 0.4);
      padding: 5px 10px;
      width: 100%;
      border-radius: 4px;
      outline: none;
    }
    .stat-row {
      margin-bottom: 12px;
    }
    .stat-info {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      margin-bottom: 5px;
    }
    .pct {
      color: #00e5ff;
      font-weight: bold;
    }
    .progress-bar {
      width: 100%;
      height: 4px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 2px;
      overflow: hidden;
    }
    .fill {
      height: 100%;
      transition: width 0.3s ease;
    }
    .fill.attackers {
      background: #00e5ff;
      box-shadow: 0 0 8px #00e5ff;
    }
    .fill.attacked {
      background: #ff0050;
      box-shadow: 0 0 8px #ff0050;
    }
  `]
})
export class ComponenteEstadisticasAmenazas {
  constructor(public servicioAmenazas: ServicioMapaAmenazas) {}
}

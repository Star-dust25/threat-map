import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicioMapaAmenazas } from '../../../core/services/threat-map.service';

@Component({
  selector: 'app-tipos-ataque',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="panel">
      <h3>TIPOS DE ATAQUE</h3>
      <div class="filters">
        <label *ngFor="let tipo of tiposDisponibles" class="checkbox-container">
          <input type="checkbox" 
                 [checked]="esTipoSeleccionado(tipo)" 
                 (change)="alternarTipo(tipo, $event)">
          <span class="checkmark"></span>
          {{ tipo }}
        </label>
      </div>
    </div>
  `,
  styles: [`
    .panel {
      background: rgba(10, 15, 30, 0.85);
      border: 1px solid rgba(0, 229, 255, 0.2);
      border-radius: 8px;
      padding: 20px;
      width: 200px;
      color: #fff;
      font-family: 'Inter', sans-serif;
      backdrop-filter: blur(8px);
    }
    h3 {
      margin: 0 0 15px 0;
      color: #00e5ff;
      font-size: 14px;
      letter-spacing: 1.5px;
      font-weight: 600;
    }
    .filters {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    .checkbox-container {
      display: flex;
      align-items: center;
      position: relative;
      cursor: pointer;
      font-size: 13px;
      user-select: none;
      padding-left: 28px;
    }
    .checkbox-container input {
      position: absolute;
      opacity: 0;
      cursor: pointer;
      height: 0;
      width: 0;
    }
    .checkmark {
      position: absolute;
      top: 0;
      left: 0;
      height: 16px;
      width: 16px;
      background-color: transparent;
      border: 1px solid #00e5ff;
      border-radius: 50%;
      transition: all 0.2s;
    }
    .checkbox-container input:checked ~ .checkmark {
      background-color: transparent;
      box-shadow: 0 0 8px rgba(0, 229, 255, 0.6);
    }
    .checkmark:after {
      content: "";
      position: absolute;
      display: none;
    }
    .checkbox-container input:checked ~ .checkmark:after {
      display: block;
    }
    .checkbox-container .checkmark:after {
      left: 5px;
      top: 2px;
      width: 4px;
      height: 8px;
      border: solid #00e5ff;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
  `]
})
export class ComponenteTiposAtaque {
  tiposDisponibles = ['DDoS', 'Malware', 'Phishing', 'Ransomware', 'SQLi', 'Brute Force'];
  
  constructor(private servicioAmenazas: ServicioMapaAmenazas) {}

  esTipoSeleccionado(tipo: string): boolean {
    return this.servicioAmenazas.obtenerTiposAtaquePermitidos().has(tipo);
  }

  alternarTipo(tipo: string, evento: Event): void {
    const estaMarcado = (evento.target as HTMLInputElement).checked;
    const tiposActuales = new Set(this.servicioAmenazas.obtenerTiposAtaquePermitidos());
    
    if (estaMarcado) {
      tiposActuales.add(tipo);
    } else {
      tiposActuales.delete(tipo);
    }
    
    this.servicioAmenazas.establecerTiposAtaquePermitidos(tiposActuales);
  }
}

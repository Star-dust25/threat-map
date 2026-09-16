import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EstadoConexion } from '../../../core/services/websocket.service';

@Component({
  selector: 'app-indicador-estado',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="status-container" [ngClass]="obtenerClaseEstado()">
      <div class="indicator"></div>
      <span class="text">{{ estado }}</span>
    </div>
  `,
  styles: [`
    .status-container {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 20px;
      background: rgba(15, 15, 27, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(5px);
      font-family: 'Inter', sans-serif;
      font-weight: 500;
      color: #fff;
    }
    
    .indicator {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #ccc;
    }

    .en-vivo .indicator {
      background: #00ff80;
      box-shadow: 0 0 10px #00ff80;
      animation: pulse 2s infinite;
    }

    .conectando .indicator {
      background: #ffcc00;
      box-shadow: 0 0 10px #ffcc00;
    }

    .desconectado .indicator {
      background: #ff0032;
      box-shadow: 0 0 10px #ff0032;
    }

    @keyframes pulse {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 255, 128, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(0, 255, 128, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 255, 128, 0); }
    }
  `]
})
export class ComponenteIndicadorEstado {
  @Input() estado: EstadoConexion | null = EstadoConexion.Desconectado;

  obtenerClaseEstado(): string {
    if (!this.estado) return '';
    return this.estado.replace(' ', '-').toLowerCase();
  }
}

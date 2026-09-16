import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

export enum EstadoConexion {
  Conectando = 'Conectando',
  EnVivo = 'En vivo',
  Desconectado = 'Desconectado'
}

@Injectable({
  providedIn: 'root'
})
export class ServicioWebSocket implements OnDestroy {
  private socket$!: WebSocketSubject<any>;
  private mensajesSujeto$ = new Subject<any>();
  private estadoConexionSujeto$ = new BehaviorSubject<EstadoConexion>(EstadoConexion.Desconectado);
  private intervaloReconexion = 3000;

  public mensajes$ = this.mensajesSujeto$.asObservable();
  public estadoConexion$ = this.estadoConexionSujeto$.asObservable();

  constructor() {}

  public conectar(url: string): void {
    if (!this.socket$ || this.socket$.closed) {
      this.estadoConexionSujeto$.next(EstadoConexion.Conectando);
      
      this.socket$ = webSocket({
        url,
        openObserver: {
          next: () => {
            console.log('[WebSocket] Conectado');
            this.estadoConexionSujeto$.next(EstadoConexion.EnVivo);
          }
        },
        closeObserver: {
          next: () => {
            console.log('[WebSocket] Desconectado');
            this.estadoConexionSujeto$.next(EstadoConexion.Desconectado);
            this.socket$ = undefined as any;
            setTimeout(() => this.conectar(url), this.intervaloReconexion);
          }
        }
      });

      this.socket$.subscribe({
        next: (mensaje) => this.mensajesSujeto$.next(mensaje),
        error: (error) => {
          console.error('[WebSocket] Error', error);
          this.estadoConexionSujeto$.next(EstadoConexion.Desconectado);
        }
      });
    }
  }

  public enviarMensaje(mensaje: any): void {
    if (this.socket$) {
      this.socket$.next(mensaje);
    }
  }

  ngOnDestroy(): void {
    if (this.socket$) {
      this.socket$.complete();
    }
    this.mensajesSujeto$.complete();
    this.estadoConexionSujeto$.complete();
  }
}

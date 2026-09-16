import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Amenaza } from '../../../core/models/threat.model';
import { ServicioMapaAmenazas } from '../../../core/services/threat-map.service';
import { Deck } from '@deck.gl/core';
import { ArcLayer, GeoJsonLayer, TextLayer } from '@deck.gl/layers';

@Component({
  selector: 'app-mapa-amenazas',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div #contenedorDeck class="deck-container"></div>
  `,
  styles: [`
    .deck-container {
      width: 100vw;
      height: 100vh;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
      background: 
        linear-gradient(rgba(0, 229, 255, 0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 229, 255, 0.05) 1px, transparent 1px);
      background-size: 40px 40px;
      background-color: #050a1f;
    }
  `]
})
export class ComponenteMapaAmenazas implements OnInit, OnDestroy {
  @ViewChild('contenedorDeck', { static: true }) contenedorDeck!: ElementRef<HTMLDivElement>;

  private instanciaDeck!: Deck;
  private suscripcionAmenazas!: Subscription;
  private amenazasActuales: Amenaza[] = [];

  constructor(private servicioAmenazas: ServicioMapaAmenazas) {}

  ngOnInit(): void {
    this.instanciaDeck = new Deck({
      parent: this.contenedorDeck.nativeElement,
      initialViewState: {
        longitude: 0,
        latitude: 20,
        zoom: 2,
        pitch: 45,
        bearing: 0
      },
      controller: true,
      layers: []
    });

    this.suscripcionAmenazas = this.servicioAmenazas.amenazasActivas$.subscribe(amenazas => {
      this.amenazasActuales = amenazas;
      this.actualizarCapas();
    });
  }

  private actualizarCapas(): void {
    const capaMapaBase = new GeoJsonLayer({
      id: 'base-map',
      data: 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_admin_0_scale_rank.geojson',
      stroked: true,
      filled: true,
      lineWidthMinPixels: 1,
      getLineColor: [0, 229, 255, 80],
      getFillColor: [15, 25, 60, 200]
    });

    const capaArcos = new ArcLayer({
      id: 'threat-arcs',
      data: this.amenazasActuales,
      getSourcePosition: (d: Amenaza) => [d.source.lon, d.source.lat],
      getTargetPosition: (d: Amenaza) => [d.target.lon, d.target.lat],
      getSourceColor: (d: Amenaza) => d.color as [number, number, number],
      getTargetColor: (d: Amenaza) => d.color as [number, number, number],
      getWidth: 2,
      getTilt: 15
    });

    const datosTexto = this.amenazasActuales.flatMap(a => [
      { position: [a.source.lon, a.source.lat], text: a.source.country, color: [0, 229, 255, 255] as [number, number, number, number] },
      { position: [a.target.lon, a.target.lat], text: a.target.country, color: [255, 0, 80, 255] as [number, number, number, number] }
    ]);

    const capaTexto = new TextLayer({
      id: 'threat-text',
      data: datosTexto,
      getPosition: d => d.position,
      getText: d => d.text,
      getSize: 12,
      getColor: d => d.color,
      getAngle: 0,
      getTextAnchor: 'middle',
      getAlignmentBaseline: 'center',
      background: true,
      getBackgroundColor: [10, 15, 30, 220],
      backgroundPadding: [10, 6, 10, 6],
      pixelOffset: [0, -15],
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontWeight: 'bold',
      characterSet: 'auto'
    });

    this.instanciaDeck.setProps({
      layers: [capaMapaBase, capaArcos, capaTexto]
    });
  }

  ngOnDestroy(): void {
    if (this.suscripcionAmenazas) {
      this.suscripcionAmenazas.unsubscribe();
    }
    if (this.instanciaDeck) {
      this.instanciaDeck.finalize();
    }
  }
}

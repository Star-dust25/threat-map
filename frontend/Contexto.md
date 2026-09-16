# Prompt de Contexto: Réplica de "Live Threat Map" (Proyecto Nivel Avanzado)

## 1. Contexto del Proyecto y Estándares de Calidad
Actúa como un Senior Full-Stack Developer, experto en Arquitectura de Software, Ciberseguridad y UI/UX. Necesito desarrollar una réplica funcional del "Radware Live Threat Map" para un proyecto de examen. 

Aunque es un proyecto académico, el código debe cumplir con estándares estrictos de la industria:
*   **Mantenibilidad y Escalabilidad:** Arquitectura limpia, principios SOLID y Clean Code.
*   **Buenas Prácticas:** Tipado estricto, manejo eficiente de memoria y separación de responsabilidades.
*   **UI/UX:** Diseño moderno "Dark Mode" (estilo ciberseguridad), interfaz intuitiva, animaciones fluidas (60fps) y diseño responsive.
*   **Seguridad:** Validación de conexiones y manejo seguro de datos en tiempo real.

## 2. Stack Tecnológico Elegido
*   **Backend:** Go (Golang) estructurado en capas.
*   **Comunicación:** WebSockets (librería `gorilla/websocket`).
*   **Frontend:** Angular (arquitectura modular, tipado estricto en TypeScript).
*   **Estado (State Management):** RxJS (con manejo riguroso de suscripciones para evitar memory leaks).
*   **Visualización:** Deck.gl (ArcLayer) integrado de forma eficiente sobre un mapa base oscuro.

## 3. Requerimientos Técnicos y Arquitectura
1.  **Backend (Go):** 
    *   Uso eficiente de *Goroutines* y *Channels* para la generación de datos (mocking) evitando *race conditions*.
    *   Manejo de concurrencia seguro en el WebSocket Hub (registrar/desregistrar clientes sin bloqueos).
    *   Seguridad: Configurar el `Upgrader` del WebSocket validando el `CheckOrigin` y limitando el tamaño del payload.
    *   Implementación de *Graceful Shutdown*.
2.  **Frontend (Angular):**
    *   Servicios dedicados y aislados (ej. `WebSocketService`, `ThreatMapService`).
    *   Uso de `ChangeDetectionStrategy.OnPush` para maximizar el rendimiento del renderizado en tiempo real.
    *   UX: Indicadores visuales del estado de conexión del WebSocket (Conectando, En vivo, Desconectado) y manejo amigable de errores.
    *   Gestión estricta del ciclo de vida (`ngOnDestroy`) para cerrar conexiones y limpiar el mapa.

## 4. Estructura de Datos (Contrato Backend-Frontend)
```json
{
  "id": "uuid-v4",
  "timestamp": "2023-10-25T14:30:00Z",
  "source": { "lat": 55.75, "lon": 37.61, "country": "Russia" },
  "target": { "lat": 38.90, "lon": -77.03, "country": "USA" },
  "attackType": "DDoS",
  "severity": "HIGH", 
  "color": [255, 0, 50] // RGB calculado según el tipo/severidad
}
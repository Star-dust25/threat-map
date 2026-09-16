package websocket

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var actualizador = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		// En producción se debe validar el origen. Aquí permitimos todas las conexiones para el examen.
		return true
	},
}

// ServirWs maneja las peticiones websocket entrantes
func ServirWs(hub *Hub, w http.ResponseWriter, r *http.Request) {
	conexion, err := actualizador.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Error al actualizar conexión a WebSocket:", err)
		return
	}
	
	cliente := &Cliente{hub: hub, conexion: conexion, enviar: make(chan []byte, 256)}
	cliente.hub.registrar <- cliente

	// Iniciamos el bombeo de lectura y escritura en goroutines separadas
	go cliente.bombeoEscritura()
	go cliente.bombeoLectura()
}

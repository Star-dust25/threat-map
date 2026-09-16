package websocket

import (
	"log"
	"time"

	"github.com/gorilla/websocket"
)

const (
	// Tiempo permitido para escribir un mensaje al cliente.
	esperaEscritura = 10 * time.Second

	// Tiempo permitido para leer el siguiente mensaje "pong" del cliente.
	esperaPong = 60 * time.Second

	// Enviar "pings" al cliente con este intervalo. Debe ser menor que esperaPong.
	periodoPing = (esperaPong * 9) / 10

	// Tamaño máximo del mensaje permitido.
	tamanoMaximoMensaje = 512
)

// Cliente actúa como un intermediario entre la conexión websocket y el hub.
type Cliente struct {
	hub *Hub

	// La conexión del websocket.
	conexion *websocket.Conn

	// Canal para almacenar los mensajes de salida.
	enviar chan []byte
}

// bombeoEscritura bombea los mensajes desde el hub hacia la conexión websocket.
func (c *Cliente) bombeoEscritura() {
	temporizador := time.NewTicker(periodoPing)
	defer func() {
		temporizador.Stop()
		c.conexion.Close()
	}()
	for {
		select {
		case mensaje, ok := <-c.enviar:
			c.conexion.SetWriteDeadline(time.Now().Add(esperaEscritura))
			if !ok {
				// El hub cerró el canal.
				c.conexion.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			escritor, err := c.conexion.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			escritor.Write(mensaje)

			if err := escritor.Close(); err != nil {
				return
			}
		case <-temporizador.C:
			c.conexion.SetWriteDeadline(time.Now().Add(esperaEscritura))
			if err := c.conexion.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// bombeoLectura bombea los mensajes desde la conexión websocket hacia el hub.
func (c *Cliente) bombeoLectura() {
	defer func() {
		c.hub.desregistrar <- c
		c.conexion.Close()
	}()
	c.conexion.SetReadLimit(tamanoMaximoMensaje)
	c.conexion.SetReadDeadline(time.Now().Add(esperaPong))
	c.conexion.SetPongHandler(func(string) error { c.conexion.SetReadDeadline(time.Now().Add(esperaPong)); return nil })
	for {
		_, _, err := c.conexion.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}
	}
}

package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"threat-map/internal/generator"
	"threat-map/internal/models"
	ws "threat-map/internal/websocket"
)

func main() {
	// Inicializar el Hub de WebSockets
	hub := ws.NuevoHub()
	go hub.Ejecutar()

	// Crear canal de amenazas e iniciar el generador
	canalAmenazas := make(chan models.Amenaza, 100)
	go generator.GenerarAmenazas(canalAmenazas, 500*time.Millisecond) // Generar 2 amenazas por segundo

	// Consumir amenazas y difundirlas (broadcast)
	go func() {
		for amenaza := range canalAmenazas {
			datos, err := json.Marshal(amenaza)
			if err != nil {
				log.Println("Error al convertir amenaza a JSON:", err)
				continue
			}
			hub.DifundirMensaje(datos)
		}
	}()

	// Configurar la ruta del WebSocket
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		ws.ServirWs(hub, w, r)
	})

	servidor := &http.Server{
		Addr:    ":8080",
		Handler: nil, // Utiliza el ServeMux por defecto
	}

	// Iniciar servidor HTTP
	go func() {
		log.Println("Servidor iniciando en :8080")
		if err := servidor.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Error ListenAndServe: %v", err)
		}
	}()

	// Apagado elegante (Graceful Shutdown)
	salir := make(chan os.Signal, 1)
	signal.Notify(salir, syscall.SIGINT, syscall.SIGTERM)
	<-salir
	log.Println("Apagando el servidor de forma segura...")

	ctx, cancelar := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancelar()

	if err := servidor.Shutdown(ctx); err != nil {
		log.Fatalf("El servidor fue forzado a apagarse: %v", err)
	}

	log.Println("Servidor finalizado exitosamente")
}

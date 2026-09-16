package websocket

import "log"

// Hub mantiene el registro de los clientes activos y transmite los mensajes
type Hub struct {
	// Clientes registrados.
	clientes map[*Cliente]bool

	// Mensajes entrantes que deben ser transmitidos a todos los clientes.
	difusion chan []byte

	// Solicitudes para registrar nuevos clientes.
	registrar chan *Cliente

	// Solicitudes para desregistrar clientes existentes.
	desregistrar chan *Cliente
}

// NuevoHub inicializa y devuelve una nueva instancia del Hub
func NuevoHub() *Hub {
	return &Hub{
		difusion:     make(chan []byte),
		registrar:    make(chan *Cliente),
		desregistrar: make(chan *Cliente),
		clientes:     make(map[*Cliente]bool),
	}
}

// Ejecutar inicia el bucle principal del Hub para manejar las conexiones
func (h *Hub) Ejecutar() {
	for {
		select {
		case cliente := <-h.registrar:
			h.clientes[cliente] = true
			log.Println("Nuevo cliente conectado. Total:", len(h.clientes))
			
		case cliente := <-h.desregistrar:
			if _, ok := h.clientes[cliente]; ok {
				delete(h.clientes, cliente)
				close(cliente.enviar)
				log.Println("Cliente desconectado. Total:", len(h.clientes))
			}
			
		case mensaje := <-h.difusion:
			for cliente := range h.clientes {
				select {
				case cliente.enviar <- mensaje:
				default:
					close(cliente.enviar)
					delete(h.clientes, cliente)
				}
			}
		}
	}
}

// DifundirMensaje expone el canal de difusión para enviar mensajes externamente
func (h *Hub) DifundirMensaje(mensaje []byte) {
	h.difusion <- mensaje
}

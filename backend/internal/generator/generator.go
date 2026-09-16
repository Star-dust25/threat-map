package generator

import (
	"math/rand"
	"time"

	"github.com/google/uuid"
	"threat-map/internal/models"
)

var (
	// Lista de ubicaciones predefinidas para simular los ataques
	ubicaciones = []models.Ubicacion{
		{Latitud: 55.75, Longitud: 37.61, Pais: "Russia"},
		{Latitud: 38.90, Longitud: -77.03, Pais: "USA"},
		{Latitud: 39.90, Longitud: 116.40, Pais: "China"},
		{Latitud: 51.50, Longitud: -0.12, Pais: "UK"},
		{Latitud: -23.55, Longitud: -46.63, Pais: "Brazil"},
		{Latitud: 48.85, Longitud: 2.35, Pais: "France"},
		{Latitud: -33.86, Longitud: 151.20, Pais: "Australia"},
		{Latitud: 35.67, Longitud: 139.65, Pais: "Japan"},
		{Latitud: 19.43, Longitud: -99.13, Pais: "Mexico"},
		{Latitud: 28.61, Longitud: 77.20, Pais: "India"},
	}

	// Tipos de ataques comunes
	tiposAtaque = []string{"DDoS", "Malware", "Phishing", "Ransomware", "SQLi", "Brute Force"}
	
	// Niveles de severidad del ataque
	severidades = []string{"LOW", "MEDIUM", "HIGH", "CRITICAL"}
)

// generarColor calcula el color del arco basado en la severidad del ataque
func generarColor(severidad string) []int {
	switch severidad {
	case "LOW":
		return []int{0, 255, 128} // Verde cibernético
	case "MEDIUM":
		return []int{255, 215, 0} // Dorado
	case "HIGH":
		return []int{255, 100, 0} // Naranja
	case "CRITICAL":
		return []int{255, 0, 50}  // Rojo
	default:
		return []int{200, 200, 200}
	}
}

// GenerarAmenazas produce amenazas aleatorias y las envía a través de un canal
func GenerarAmenazas(canalAmenazas chan<- models.Amenaza, intervalo time.Duration) {
	temporizador := time.NewTicker(intervalo)
	defer temporizador.Stop()

	// Generador de números aleatorios local para evitar bloqueos
	rng := rand.New(rand.NewSource(time.Now().UnixNano()))

	for {
		<-temporizador.C
		
		indiceOrigen := rng.Intn(len(ubicaciones))
		indiceDestino := rng.Intn(len(ubicaciones))
		
		// Aseguramos que el origen y destino no sean el mismo
		for indiceOrigen == indiceDestino {
			indiceDestino = rng.Intn(len(ubicaciones))
		}

		severidad := severidades[rng.Intn(len(severidades))]
		
		amenaza := models.Amenaza{
			ID:            uuid.New().String(),
			MarcaDeTiempo: time.Now().UTC(),
			Origen:        ubicaciones[indiceOrigen],
			Destino:       ubicaciones[indiceDestino],
			TipoAtaque:    tiposAtaque[rng.Intn(len(tiposAtaque))],
			Severidad:     severidad,
			Color:         generarColor(severidad),
		}

		// Envío no bloqueante al canal
		select {
		case canalAmenazas <- amenaza:
		default:
			// Si el canal está lleno, descartamos la amenaza para no bloquear la ejecución
		}
	}
}

package models

import "time"

// Ubicacion representa las coordenadas geográficas y el país
type Ubicacion struct {
	Latitud  float64 `json:"lat"`
	Longitud float64 `json:"lon"`
	Pais     string  `json:"country"`
}

// Amenaza representa un ataque cibernético en tiempo real
// Se mantienen los tags JSON originales para no romper la integración con el frontend.
type Amenaza struct {
	ID            string    `json:"id"`
	MarcaDeTiempo time.Time `json:"timestamp"`
	Origen        Ubicacion `json:"source"`
	Destino       Ubicacion `json:"target"`
	TipoAtaque    string    `json:"attackType"`
	Severidad     string    `json:"severity"`
	Color         []int     `json:"color"`
}

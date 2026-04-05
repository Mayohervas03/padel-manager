package com.padel.api.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "pistas")
public class Pista {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre; // Ej: "Pista 1 (Cristal)"

    private String tipo;      // Ej: "Cristal", "Muro"
    
    private String ubicacion; // Ej: "Indoor", "Outdoor"

    private Double precio; // Ej: 12.50

    @Column(columnDefinition = "boolean default true")
    private Boolean activo = true;
}
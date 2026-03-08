package com.padel.api.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data // Esto de Lombok nos crea los Getters y Setters automáticamente
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    @Column(unique = true)
    private String email;

    private String password;

    private String rol; // Por ahora usaremos un String simple ("ADMIN", "JUGADOR")
}
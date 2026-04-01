package com.padel.api.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;
@Entity
@Data
@Table(name = "reservas")
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate fecha;
    private LocalTime hora;

    // Conectamos con el Usuario (Muchas reservas pueden ser de un Usuario)
    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    // Conectamos con la Pista (Muchas reservas pueden ser en una Pista)
    @ManyToOne
    @JoinColumn(name = "pista_id")
    private Pista pista;
}

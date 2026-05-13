package com.padel.api.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Getter
@Setter
@Table(name = "reservas")
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate fecha;
    private LocalTime hora;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoReserva estado = EstadoReserva.PENDIENTE;

    private Double precioPagado;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Version
    private Long version;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    @JsonIgnoreProperties({"password", "rol", "reservas", "clases"})
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "pista_id")
    @JsonIgnoreProperties({"reservas", "clases"})
    private Pista pista;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}

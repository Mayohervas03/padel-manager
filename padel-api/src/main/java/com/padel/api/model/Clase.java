package com.padel.api.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "clases")
public class Clase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titulo;
    private String monitor;

    @Enumerated(EnumType.STRING)
    private NivelClase nivel;

    private Double precio;
    private Integer maxAlumnos;

    private LocalDate fecha;
    private LocalTime hora;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoClase estado = EstadoClase.PROGRAMADA;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "pista_id")
    private Pista pista;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "clase_alumnos",
        joinColumns = @JoinColumn(name = "clase_id"),
        inverseJoinColumns = @JoinColumn(name = "usuario_id")
    )
    @JsonIgnoreProperties({"password", "rol"})
    private List<Usuario> alumnos = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}

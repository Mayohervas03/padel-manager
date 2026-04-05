package com.padel.api.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
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
}

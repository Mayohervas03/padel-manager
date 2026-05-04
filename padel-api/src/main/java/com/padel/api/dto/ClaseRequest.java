package com.padel.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class ClaseRequest {
    @NotBlank(message = "El titulo es obligatorio")
    private String titulo;

    @NotBlank(message = "El monitor es obligatorio")
    private String monitor;

    @NotNull(message = "El nivel es obligatorio")
    private String nivel;

    @NotNull(message = "El precio es obligatorio")
    @Positive(message = "El precio debe ser positivo")
    private Double precio;

    @NotNull(message = "El maximo de alumnos es obligatorio")
    @Positive(message = "El maximo de alumnos debe ser positivo")
    private Integer maxAlumnos;

    @NotNull(message = "La fecha es obligatoria")
    private LocalDate fecha;

    @NotNull(message = "La hora es obligatoria")
    private LocalTime hora;

    @NotNull(message = "El ID de la pista es obligatorio")
    private Long pistaId;
}

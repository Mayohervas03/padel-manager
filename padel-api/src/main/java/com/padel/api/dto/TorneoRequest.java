package com.padel.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import com.padel.api.model.EstadoTorneo;

import java.time.LocalDate;

@Data
public class TorneoRequest {
    @NotBlank(message = "El titulo es obligatorio")
    private String titulo;

    private String descripcion;

    @NotNull(message = "La fecha de inicio es obligatoria")
    private LocalDate fechaInicio;

    @NotNull(message = "La fecha de fin es obligatoria")
    private LocalDate fechaFin;

    @NotNull(message = "El precio por pareja es obligatorio")
    @Positive(message = "El precio debe ser positivo")
    private Double precioPareja;

    @NotNull(message = "El maximo de parejas es obligatorio")
    @Positive(message = "El maximo de parejas debe ser positivo")
    private Integer maxParejas;

    private String imagenUrl;

    private EstadoTorneo estado;

    private LocalDate fechaCierreInscripcion;
}

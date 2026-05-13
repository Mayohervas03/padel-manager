package com.padel.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import com.padel.api.model.EstadoTorneo;

import java.time.LocalDate;
import java.util.List;

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

    @NotEmpty(message = "Debe definir al menos una categoria")
    private List<CategoriaTorneoRequest> categorias;

    private String imagenUrl;

    private EstadoTorneo estado;

    private LocalDate fechaCierreInscripcion;
}

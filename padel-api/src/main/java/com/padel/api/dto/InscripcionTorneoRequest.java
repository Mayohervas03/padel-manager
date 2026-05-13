package com.padel.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InscripcionTorneoRequest {
    @NotBlank(message = "El nombre del compañero es obligatorio")
    private String nombreCompanero;

    @NotNull(message = "La categoria es obligatoria")
    private Long categoriaId;
}

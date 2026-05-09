package com.padel.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class InscripcionTorneoRequest {
    @NotBlank(message = "El nombre del compañero es obligatorio")
    private String nombreCompanero;

    @NotBlank(message = "La categoría es obligatoria")
    private String categoria;
}

package com.padel.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class CategoriaTorneoRequest {
    
    @NotBlank(message = "El nombre de la categoria es obligatorio")
    private String nombre;
    
    @NotNull(message = "El maximo de parejas es obligatorio")
    @Positive(message = "El maximo de parejas debe ser positivo")
    private Integer maxParejas;
}

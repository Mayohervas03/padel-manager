package com.padel.api.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CambioEstadoPedidoRequest {
    @NotNull(message = "El estado es obligatorio")
    private String estado;
}

package com.padel.api.dto;

import com.padel.api.model.EstadoReserva;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CambioEstadoReservaRequest {

    @NotNull(message = "El estado es obligatorio")
    private EstadoReserva estado;
}

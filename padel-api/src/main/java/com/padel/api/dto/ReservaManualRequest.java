package com.padel.api.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ReservaManualRequest {
    @NotNull(message = "El ID de usuario es obligatorio")
    private Long usuarioId;

    @NotNull(message = "El ID de pista es obligatorio")
    private Long pistaId;

    @NotNull(message = "La fecha es obligatoria")
    private String fecha;

    @NotNull(message = "La hora es obligatoria")
    private String hora;
}

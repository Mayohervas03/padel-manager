package com.padel.api.dto;

import lombok.Data;

@Data
public class ReservaManualRequest {
    private Long usuarioId;
    private Long pistaId;
    private String fecha;
    private String hora;
}

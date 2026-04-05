package com.padel.api.dto;

import lombok.Data;

@Data
public class PerfilDTO {
    private String nombre;
    private String email;
    private String proximaReserva;
    private long partidosMes;
}

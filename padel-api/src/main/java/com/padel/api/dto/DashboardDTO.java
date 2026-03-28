package com.padel.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDTO {
    private long totalUsuarios;
    private long totalPistas;
    private long reservasTotales;
    private long reservasHoy;
}

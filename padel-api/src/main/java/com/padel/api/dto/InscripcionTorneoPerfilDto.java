package com.padel.api.dto;

import com.padel.api.model.InscripcionTorneo;
import lombok.Data;

import java.time.LocalDate;

@Data
public class InscripcionTorneoPerfilDto {
    private Long id;
    private Long torneoId;
    private String torneoTitulo;
    private String torneoDescripcion;
    private LocalDate torneoFechaInicio;
    private LocalDate torneoFechaFin;
    private Double torneoPrecioPareja;
    private String torneoImagenUrl;
    private String nombreCompanero;
    private String categoria;
    private boolean pagado;
    private LocalDate fechaInscripcion;
    private String estadoInscripcion;

    public static InscripcionTorneoPerfilDto fromEntity(InscripcionTorneo inscripcion) {
        InscripcionTorneoPerfilDto dto = new InscripcionTorneoPerfilDto();
        dto.setId(inscripcion.getId());
        dto.setTorneoId(inscripcion.getTorneo().getId());
        dto.setTorneoTitulo(inscripcion.getTorneo().getTitulo());
        dto.setTorneoDescripcion(inscripcion.getTorneo().getDescripcion());
        dto.setTorneoFechaInicio(inscripcion.getTorneo().getFechaInicio());
        dto.setTorneoFechaFin(inscripcion.getTorneo().getFechaFin());
        dto.setTorneoPrecioPareja(inscripcion.getTorneo().getPrecioPareja());
        dto.setTorneoImagenUrl(inscripcion.getTorneo().getImagenUrl());
        dto.setNombreCompanero(inscripcion.getNombreCompanero());
        dto.setCategoria(inscripcion.getCategoria());
        dto.setPagado(inscripcion.isPagado());
        dto.setFechaInscripcion(inscripcion.getFechaInscripcion());
        dto.setEstadoInscripcion(inscripcion.getEstado().name());
        return dto;
    }
}

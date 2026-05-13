package com.padel.api.dto;

import lombok.Data;
import com.padel.api.model.EstadoInscripcion;
import com.padel.api.model.InscripcionTorneo;

import java.time.LocalDate;

@Data
public class InscripcionTorneoDto {
    private Long id;
    private Long torneoId;
    private String usuarioNombre;
    private String usuarioEmail;
    private String nombreCompanero;
    private CategoriaTorneoDto categoria;
    private boolean pagado;
    private LocalDate fechaInscripcion;
    private EstadoInscripcion estado;

    public static InscripcionTorneoDto fromEntity(InscripcionTorneo inscripcion) {
        InscripcionTorneoDto dto = new InscripcionTorneoDto();
        dto.setId(inscripcion.getId());
        dto.setTorneoId(inscripcion.getTorneo().getId());
        dto.setUsuarioNombre(inscripcion.getUser1().getNombre());
        dto.setUsuarioEmail(inscripcion.getUser1().getEmail());
        dto.setNombreCompanero(inscripcion.getNombreCompanero());
        dto.setCategoria(CategoriaTorneoDto.fromEntity(inscripcion.getCategoriaTorneo()));
        dto.setPagado(inscripcion.isPagado());
        dto.setFechaInscripcion(inscripcion.getFechaInscripcion());
        dto.setEstado(inscripcion.getEstado());
        return dto;
    }
}

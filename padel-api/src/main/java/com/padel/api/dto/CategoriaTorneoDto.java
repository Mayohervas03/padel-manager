package com.padel.api.dto;

import com.padel.api.model.CategoriaTorneo;
import lombok.Data;

@Data
public class CategoriaTorneoDto {
    private Long id;
    private String nombre;
    private Integer maxParejas;
    private Integer inscripcionesCount;

    public static CategoriaTorneoDto fromEntity(CategoriaTorneo categoria) {
        CategoriaTorneoDto dto = new CategoriaTorneoDto();
        dto.setId(categoria.getId());
        dto.setNombre(categoria.getNombre());
        dto.setMaxParejas(categoria.getMaxParejas());
        return dto;
    }
}

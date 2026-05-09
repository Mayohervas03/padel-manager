package com.padel.api.dto;

import com.padel.api.model.CarritoItem;
import lombok.Data;

@Data
public class CarritoItemDto {
    private Long id;
    private ProductoDto producto;
    private Integer cantidad;

    public static CarritoItemDto fromEntity(CarritoItem item) {
        CarritoItemDto dto = new CarritoItemDto();
        dto.setId(item.getId());
        dto.setProducto(ProductoDto.fromEntity(item.getProducto()));
        dto.setCantidad(item.getCantidad());
        return dto;
    }
}

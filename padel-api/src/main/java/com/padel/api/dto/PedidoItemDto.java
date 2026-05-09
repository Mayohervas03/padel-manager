package com.padel.api.dto;

import com.padel.api.model.PedidoItem;
import lombok.Data;

@Data
public class PedidoItemDto {
    private Long id;
    private ProductoDto producto;
    private Integer cantidad;
    private Double precioUnitario;

    public static PedidoItemDto fromEntity(PedidoItem item) {
        PedidoItemDto dto = new PedidoItemDto();
        dto.setId(item.getId());
        dto.setProducto(ProductoDto.fromEntity(item.getProducto()));
        dto.setCantidad(item.getCantidad());
        dto.setPrecioUnitario(item.getPrecioUnitario());
        return dto;
    }
}

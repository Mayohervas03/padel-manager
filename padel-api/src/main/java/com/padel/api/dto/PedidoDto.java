package com.padel.api.dto;

import com.padel.api.model.Pedido;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class PedidoDto {
    private Long id;
    private LocalDateTime fecha;
    private String estado;
    private Double total;
    private List<PedidoItemDto> items;

    public static PedidoDto fromEntity(Pedido pedido) {
        PedidoDto dto = new PedidoDto();
        dto.setId(pedido.getId());
        dto.setFecha(pedido.getFecha());
        dto.setEstado(pedido.getEstado().name());
        dto.setTotal(pedido.getTotal());
        dto.setItems(pedido.getItems().stream()
                .map(PedidoItemDto::fromEntity)
                .collect(Collectors.toList()));
        return dto;
    }
}

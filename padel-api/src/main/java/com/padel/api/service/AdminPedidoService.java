package com.padel.api.service;

import com.padel.api.dto.PedidoDto;
import com.padel.api.exception.BusinessException;
import com.padel.api.exception.ResourceNotFoundException;
import com.padel.api.model.Pedido;
import com.padel.api.repository.PedidoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminPedidoService {

    private final PedidoRepository pedidoRepository;

    public List<PedidoDto> getAllPedidos() {
        return pedidoRepository.findAllByOrderByFechaDesc().stream()
                .map(PedidoDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public PedidoDto cambiarEstadoPedido(Long pedidoId, String nuevoEstadoStr) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido no encontrado"));

        Pedido.EstadoPedido nuevoEstado;
        try {
            nuevoEstado = Pedido.EstadoPedido.valueOf(nuevoEstadoStr);
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Estado no válido. Valores permitidos: PENDIENTE, COMPLETADO, CANCELADO");
        }

        Pedido.EstadoPedido estadoActual = pedido.getEstado();

        if (estadoActual == Pedido.EstadoPedido.COMPLETADO) {
            throw new BusinessException("No se puede cambiar el estado de un pedido completado");
        }

        if (estadoActual == Pedido.EstadoPedido.CANCELADO && nuevoEstado != Pedido.EstadoPedido.CANCELADO) {
            throw new BusinessException("No se puede reactivar un pedido cancelado");
        }

        pedido.setEstado(nuevoEstado);
        Pedido saved = pedidoRepository.save(pedido);
        return PedidoDto.fromEntity(saved);
    }
}

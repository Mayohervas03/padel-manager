package com.padel.api.service;

import com.padel.api.dto.PedidoDto;
import com.padel.api.exception.BusinessException;
import com.padel.api.exception.ResourceNotFoundException;
import com.padel.api.model.CarritoItem;
import com.padel.api.model.Pedido;
import com.padel.api.model.PedidoItem;
import com.padel.api.model.Producto;
import com.padel.api.model.Usuario;
import com.padel.api.repository.CarritoItemRepository;
import com.padel.api.repository.PedidoRepository;
import com.padel.api.repository.ProductoRepository;
import com.padel.api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final CarritoItemRepository carritoRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;

    public List<PedidoDto> getMisPedidos(String email) {
        Usuario usuario = getUsuario(email);
        return pedidoRepository.findByUsuarioIdOrderByFechaDesc(usuario.getId()).stream()
                .map(PedidoDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public PedidoDto checkout(String email) {
        Usuario usuario = getUsuario(email);
        List<CarritoItem> items = carritoRepository.findByUsuarioId(usuario.getId());

        if (items.isEmpty()) {
            throw new BusinessException("El carrito esta vacio");
        }

        for (CarritoItem item : items) {
            Producto producto = item.getProducto();
            if (producto.getStock() < item.getCantidad()) {
                throw new BusinessException("Stock insuficiente para: " + producto.getNombre() + 
                        ". Disponible: " + producto.getStock());
            }
        }

        Pedido pedido = new Pedido();
        pedido.setUsuario(usuario);
        pedido.setFecha(LocalDateTime.now());
        pedido.setEstado(Pedido.EstadoPedido.PENDIENTE);

        double total = 0;
        for (CarritoItem item : items) {
            Producto producto = item.getProducto();
            
            producto.setStock(producto.getStock() - item.getCantidad());
            productoRepository.save(producto);

            PedidoItem pedidoItem = new PedidoItem();
            pedidoItem.setPedido(pedido);
            pedidoItem.setProducto(producto);
            pedidoItem.setCantidad(item.getCantidad());
            pedidoItem.setPrecioUnitario(producto.getPrecio());
            pedido.getItems().add(pedidoItem);

            total += producto.getPrecio() * item.getCantidad();
        }

        pedido.setTotal(total);
        Pedido saved = pedidoRepository.save(pedido);

        carritoRepository.deleteByUsuarioId(usuario.getId());

        return PedidoDto.fromEntity(saved);
    }

    private Usuario getUsuario(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }
}

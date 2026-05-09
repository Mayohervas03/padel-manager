package com.padel.api.service;

import com.padel.api.dto.CarritoItemDto;
import com.padel.api.dto.CarritoItemRequest;
import com.padel.api.exception.BusinessException;
import com.padel.api.exception.ResourceNotFoundException;
import com.padel.api.model.CarritoItem;
import com.padel.api.model.Producto;
import com.padel.api.model.Usuario;
import com.padel.api.repository.CarritoItemRepository;
import com.padel.api.repository.ProductoRepository;
import com.padel.api.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CarritoService {

    private final CarritoItemRepository carritoRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;

    public List<CarritoItemDto> getCarrito(String email) {
        Usuario usuario = getUsuario(email);
        return carritoRepository.findByUsuarioId(usuario.getId()).stream()
                .map(CarritoItemDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public CarritoItemDto agregarAlCarrito(String email, CarritoItemRequest request) {
        Usuario usuario = getUsuario(email);
        Producto producto = productoRepository.findById(request.getProductoId())
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));

        if (!producto.getActivo()) {
            throw new BusinessException("El producto no esta disponible");
        }

        if (producto.getStock() < request.getCantidad()) {
            throw new BusinessException("Stock insuficiente. Disponible: " + producto.getStock());
        }

        CarritoItem item = carritoRepository.findByUsuarioIdAndProductoId(usuario.getId(), producto.getId())
                .orElse(null);

        if (item != null) {
            int nuevaCantidad = item.getCantidad() + request.getCantidad();
            if (producto.getStock() < nuevaCantidad) {
                throw new BusinessException("Stock insuficiente. Disponible: " + producto.getStock());
            }
            item.setCantidad(nuevaCantidad);
        } else {
            item = new CarritoItem();
            item.setUsuario(usuario);
            item.setProducto(producto);
            item.setCantidad(request.getCantidad());
        }

        return CarritoItemDto.fromEntity(carritoRepository.save(item));
    }

    @Transactional
    public void actualizarCantidad(String email, Long itemId, Integer cantidad) {
        Usuario usuario = getUsuario(email);
        CarritoItem item = carritoRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item no encontrado"));

        if (!item.getUsuario().getId().equals(usuario.getId())) {
            throw new BusinessException("No tienes permiso para modificar este item");
        }

        if (cantidad <= 0) {
            carritoRepository.delete(item);
            return;
        }

        if (item.getProducto().getStock() < cantidad) {
            throw new BusinessException("Stock insuficiente. Disponible: " + item.getProducto().getStock());
        }

        item.setCantidad(cantidad);
        carritoRepository.save(item);
    }

    @Transactional
    public void eliminarDelCarrito(String email, Long itemId) {
        Usuario usuario = getUsuario(email);
        CarritoItem item = carritoRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item no encontrado"));

        if (!item.getUsuario().getId().equals(usuario.getId())) {
            throw new BusinessException("No tienes permiso para eliminar este item");
        }

        carritoRepository.delete(item);
    }

    @Transactional
    public void vaciarCarrito(String email) {
        Usuario usuario = getUsuario(email);
        carritoRepository.deleteByUsuarioId(usuario.getId());
    }

    private Usuario getUsuario(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
    }
}

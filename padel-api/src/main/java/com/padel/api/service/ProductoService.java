package com.padel.api.service;

import com.padel.api.dto.ProductoDto;
import com.padel.api.dto.ProductoRequest;
import com.padel.api.exception.ResourceNotFoundException;
import com.padel.api.model.Producto;
import com.padel.api.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductoService {

    private final ProductoRepository productoRepository;

    public List<ProductoDto> findAll() {
        return productoRepository.findAll().stream()
                .map(ProductoDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<ProductoDto> findAllActivos() {
        return productoRepository.findByActivoTrue().stream()
                .map(ProductoDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<ProductoDto> findByCategoria(Producto.CategoriaProducto categoria) {
        return productoRepository.findByCategoriaAndActivoTrue(categoria).stream()
                .map(ProductoDto::fromEntity)
                .collect(Collectors.toList());
    }

    public ProductoDto findById(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));
        return ProductoDto.fromEntity(producto);
    }

    @Transactional
    public ProductoDto create(ProductoRequest request) {
        Producto producto = new Producto();
        producto.setNombre(request.getNombre());
        producto.setDescripcion(request.getDescripcion());
        producto.setPrecio(request.getPrecio());
        producto.setStock(request.getStock());
        producto.setCategoria(request.getCategoria());
        producto.setImagenUrl(request.getImagenUrl());
        producto.setActivo(request.getActivo());
        return ProductoDto.fromEntity(productoRepository.save(producto));
    }

    @Transactional
    public ProductoDto update(Long id, ProductoRequest request) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));
        producto.setNombre(request.getNombre());
        producto.setDescripcion(request.getDescripcion());
        producto.setPrecio(request.getPrecio());
        producto.setStock(request.getStock());
        producto.setCategoria(request.getCategoria());
        producto.setImagenUrl(request.getImagenUrl());
        producto.setActivo(request.getActivo());
        return ProductoDto.fromEntity(productoRepository.save(producto));
    }

    @Transactional
    public void delete(Long id) {
        if (!productoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Producto no encontrado");
        }
        productoRepository.deleteById(id);
    }
}

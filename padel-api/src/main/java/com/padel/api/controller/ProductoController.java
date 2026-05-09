package com.padel.api.controller;

import com.padel.api.dto.ProductoDto;
import com.padel.api.model.Producto;
import com.padel.api.service.ProductoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoService productoService;

    @GetMapping
    public ResponseEntity<List<ProductoDto>> getAll() {
        return ResponseEntity.ok(productoService.findAllActivos());
    }

    @GetMapping("/categoria/{categoria}")
    public ResponseEntity<List<ProductoDto>> getByCategoria(@PathVariable Producto.CategoriaProducto categoria) {
        return ResponseEntity.ok(productoService.findByCategoria(categoria));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductoDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(productoService.findById(id));
    }
}

package com.padel.api.controller;

import com.padel.api.dto.CarritoItemDto;
import com.padel.api.dto.CarritoItemRequest;
import com.padel.api.service.CarritoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/carrito")
@RequiredArgsConstructor
public class CarritoController {

    private final CarritoService carritoService;

    @GetMapping
    public ResponseEntity<List<CarritoItemDto>> getCarrito() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(carritoService.getCarrito(email));
    }

    @PostMapping
    public ResponseEntity<CarritoItemDto> agregar(@Valid @RequestBody CarritoItemRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(carritoService.agregarAlCarrito(email, request));
    }

    @PutMapping("/{itemId}")
    public ResponseEntity<Void> actualizarCantidad(@PathVariable Long itemId, @RequestParam Integer cantidad) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        carritoService.actualizarCantidad(email, itemId, cantidad);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> eliminar(@PathVariable Long itemId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        carritoService.eliminarDelCarrito(email, itemId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> vaciar() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        carritoService.vaciarCarrito(email);
        return ResponseEntity.ok().build();
    }
}

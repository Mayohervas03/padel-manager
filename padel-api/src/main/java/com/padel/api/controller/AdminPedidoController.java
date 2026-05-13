package com.padel.api.controller;

import com.padel.api.dto.CambioEstadoPedidoRequest;
import com.padel.api.dto.PedidoDto;
import com.padel.api.service.AdminPedidoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/pedidos")
@RequiredArgsConstructor
public class AdminPedidoController {

    private final AdminPedidoService adminPedidoService;

    @GetMapping
    public ResponseEntity<List<PedidoDto>> getAllPedidos() {
        return ResponseEntity.ok(adminPedidoService.getAllPedidos());
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<PedidoDto> cambiarEstado(
            @PathVariable Long id,
            @Valid @RequestBody CambioEstadoPedidoRequest request) {
        return ResponseEntity.ok(adminPedidoService.cambiarEstadoPedido(id, request.getEstado()));
    }
}

package com.padel.api.controller;

import com.padel.api.dto.PedidoDto;
import com.padel.api.service.PedidoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoService pedidoService;

    @GetMapping("/mis-pedidos")
    public ResponseEntity<List<PedidoDto>> getMisPedidos() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(pedidoService.getMisPedidos(email));
    }

    @PostMapping("/checkout")
    public ResponseEntity<PedidoDto> checkout() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(pedidoService.checkout(email));
    }
}

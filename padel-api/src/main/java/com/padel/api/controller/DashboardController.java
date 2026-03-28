package com.padel.api.controller;

import com.padel.api.dto.DashboardDTO;
import com.padel.api.repository.PistaRepository;
import com.padel.api.repository.ReservaRepository;
import com.padel.api.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:4200")
public class DashboardController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PistaRepository pistaRepository;

    @Autowired
    private ReservaRepository reservaRepository;

    @GetMapping
    public DashboardDTO getDashboardStats() {
        long totalUsuarios = usuarioRepository.count();
        long totalPistas = pistaRepository.count();
        long reservasTotales = reservaRepository.count();
        long reservasHoy = reservaRepository.countByFecha(LocalDate.now());

        return new DashboardDTO(totalUsuarios, totalPistas, reservasTotales, reservasHoy);
    }
}

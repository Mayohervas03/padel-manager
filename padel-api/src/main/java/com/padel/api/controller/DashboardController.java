package com.padel.api.controller;

import com.padel.api.dto.DashboardDTO;
import com.padel.api.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public DashboardDTO getDashboardStats() {
        return dashboardService.getDashboardStats();
    }
}

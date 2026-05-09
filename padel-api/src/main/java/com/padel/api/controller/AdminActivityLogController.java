package com.padel.api.controller;

import com.padel.api.dto.ActivityLogRequest;
import com.padel.api.model.ActivityLog;
import com.padel.api.service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/logs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminActivityLogController {

    private final ActivityLogService activityLogService;

    @GetMapping
    public ResponseEntity<List<ActivityLog>> getLogs() {
        return ResponseEntity.ok(activityLogService.findAll());
    }

    @PostMapping
    public ResponseEntity<ActivityLog> createLog(@RequestBody ActivityLogRequest request) {
        String usuario = SecurityContextHolder.getContext().getAuthentication().getName();
        ActivityLog saved = activityLogService.save(
                request.getAction(),
                request.getEntityType(),
                request.getDetails(),
                request.getEntityId(),
                usuario
        );
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping
    public ResponseEntity<Void> clearLogs() {
        activityLogService.deleteAll();
        return ResponseEntity.noContent().build();
    }
}

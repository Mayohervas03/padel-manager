package com.padel.api.service;

import com.padel.api.model.ActivityLog;
import com.padel.api.repository.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    @Transactional(readOnly = true)
    public List<ActivityLog> findAll() {
        return activityLogRepository.findTop1000ByOrderByTimestampDesc();
    }

    @Transactional
    public ActivityLog save(String action, String entityType, String details, Long entityId, String usuario) {
        ActivityLog log = new ActivityLog();
        log.setTimestamp(LocalDateTime.now());
        log.setAction(action);
        log.setEntityType(entityType);
        log.setDetails(details);
        log.setEntityId(entityId);
        log.setUsuario(usuario);
        return activityLogRepository.save(log);
    }

    @Transactional
    public void deleteAll() {
        activityLogRepository.deleteAll();
    }
}

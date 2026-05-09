package com.padel.api.dto;

import lombok.Data;

@Data
public class ActivityLogRequest {
    private String action;
    private String entityType;
    private String details;
    private Long entityId;
}

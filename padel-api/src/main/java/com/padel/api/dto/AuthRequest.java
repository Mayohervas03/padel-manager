package com.padel.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AuthRequest {
    @NotBlank(message = "El email es obligatorio")
    @Email(message = "Debe ser un email valido")
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    private String password;

    private Boolean rememberMe;
}

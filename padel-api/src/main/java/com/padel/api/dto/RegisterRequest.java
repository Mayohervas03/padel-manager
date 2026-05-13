package com.padel.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 3, max = 100, message = "El nombre debe tener entre 3 y 100 caracteres")
    private String nombre;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "Debe ser un email valido")
    @Size(max = 255, message = "El email no puede exceder 255 caracteres")
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 8, max = 128, message = "La contraseña debe tener entre 8 y 128 caracteres")
    @Pattern(
        regexp = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[@$!%*?&_#^+=-])[A-Za-z\\d@$!%*?&_#^+=-]+$",
        message = "La contraseña debe contener al menos una mayuscula, una minuscula, un numero y un caracter especial"
    )
    private String password;
}

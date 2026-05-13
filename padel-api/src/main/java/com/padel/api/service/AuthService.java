package com.padel.api.service;

import com.padel.api.dto.AuthRequest;
import com.padel.api.dto.AuthResponse;
import com.padel.api.dto.RegisterRequest;
import com.padel.api.exception.BusinessException;
import com.padel.api.model.Usuario;
import com.padel.api.repository.UsuarioRepository;
import com.padel.api.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public void register(RegisterRequest request) {
        if (usuarioRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new BusinessException("El email ya esta en uso");
        }

        validarFortalezaPassword(request.getPassword());

        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setNombre(request.getNombre());
        nuevoUsuario.setEmail(request.getEmail());
        nuevoUsuario.setPassword(passwordEncoder.encode(request.getPassword()));
        nuevoUsuario.setRol("USER");

        usuarioRepository.save(nuevoUsuario);
    }

    private void validarFortalezaPassword(String password) {
        if (password == null || password.length() < 8) {
            throw new BusinessException("La contraseña debe tener al menos 8 caracteres");
        }
        if (password.length() > 128) {
            throw new BusinessException("La contraseña no puede exceder 128 caracteres");
        }
        if (!password.matches(".*[A-Z].*")) {
            throw new BusinessException("La contraseña debe contener al menos una mayuscula");
        }
        if (!password.matches(".*[a-z].*")) {
            throw new BusinessException("La contraseña debe contener al menos una minuscula");
        }
        if (!password.matches(".*\\d.*")) {
            throw new BusinessException("La contraseña debe contener al menos un numero");
        }
        if (!password.matches(".*[@$!%*?&_#^+=-].*")) {
            throw new BusinessException("La contraseña debe contener al menos un caracter especial (@$!%*?&_#^+=-)");
        }
    }

    public AuthResponse login(AuthRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException("Credenciales invalidas"));

        if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            throw new BusinessException("Credenciales invalidas");
        }

        boolean rememberMe = request.getRememberMe() != null && request.getRememberMe();
        String token = jwtUtil.generateToken(usuario.getEmail(), usuario.getId(), rememberMe);
        return new AuthResponse(token, usuario.getEmail(), usuario.getRol(), usuario.getNombre(), usuario.getId());
    }
}

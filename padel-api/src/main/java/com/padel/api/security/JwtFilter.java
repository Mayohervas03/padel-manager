package com.padel.api.security;

import com.padel.api.model.Usuario;
import com.padel.api.repository.UsuarioRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UsuarioRepository usuarioRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String requestURI = request.getRequestURI();
        String email = null;
        String jwt = null;

        log.debug("JwtFilter - Procesando peticion: {} {}", request.getMethod(), requestURI);

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);
            log.debug("JwtFilter - Token encontrado para {}", requestURI);
            try {
                email = jwtUtil.extractEmail(jwt);
                log.debug("JwtFilter - Email extraido del token: {}", email);
            } catch (Exception e) {
                log.warn("JwtFilter - Error extrayendo email del token: {}", e.getMessage());
            }
        } else {
            log.debug("JwtFilter - No se encontro header Authorization para {}", requestURI);
        }

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            if (jwtUtil.validateToken(jwt, email)) {
                log.debug("JwtFilter - Token valido para: {}", email);
                Optional<Usuario> optionalUser = usuarioRepository.findByEmail(email);

                if (optionalUser.isPresent()) {
                    Usuario dbUser = optionalUser.get();
                    String rol = dbUser.getRol() != null ? dbUser.getRol() : "USER";
                    log.debug("JwtFilter - Usuario encontrado: {} con rol: {}", dbUser.getEmail(), rol);

                    UserDetails userDetails = new User(
                        dbUser.getEmail(),
                        "",
                        Collections.singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + rol))
                    );

                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());

                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    log.debug("JwtFilter - Autenticacion establecida para: {}", email);
                } else {
                    log.warn("JwtFilter - Usuario no encontrado en BD: {}", email);
                }
            } else {
                log.warn("JwtFilter - Token invalido para: {}", email);
            }
        }

        filterChain.doFilter(request, response);
    }
}

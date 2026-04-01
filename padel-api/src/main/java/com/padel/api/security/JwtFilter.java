package com.padel.api.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private com.padel.api.repository.UsuarioRepository usuarioRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        String email = null;
        String jwt = null;

        // Extraer el token del header (formato: "Bearer {token}")
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);
            try {
                email = jwtUtil.extractEmail(jwt);
            } catch (Exception e) {
                // Token inválido o expirado
            }
        }

        // Si hay email y el contexto no está autenticado
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            
            // Validamos que el token pertenezca al usuario
            if (jwtUtil.validateToken(jwt, email)) {
                
                java.util.Optional<com.padel.api.model.Usuario> optionalUser = usuarioRepository.findByEmail(email);
                
                if (optionalUser.isPresent()) {
                    com.padel.api.model.Usuario dbUser = optionalUser.get();
                    String rol = dbUser.getRol() != null ? dbUser.getRol() : "USER";
                    
                    // Creamos un UserDetails oficial inyectando el prefijo esperado por @PreAuthorize
                    UserDetails userDetails = new User(
                        dbUser.getEmail(), 
                        "", 
                        Collections.singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + rol))
                    );

                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    // Registramos al usuario en el contexto de seguridad
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        }
        
        // Continuamos con la cadena de filtros
        filterChain.doFilter(request, response);
    }
}

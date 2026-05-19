package com.saas.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtils jwtUtils;

    // Assurez-vous d'avoir bien la classe CustomUserDetailsService dans votre dossier security
    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        try {
            // 1. On récupère le Token de la requête
            String jwt = parseJwt(request);

            // 2. Si on a trouvé un token, on l'analyse
            if (jwt != null) {
                String email = jwtUtils.getEmailFromToken(jwt);

                // 3. Si on a trouvé un email et que l'utilisateur n'est pas déjà authentifié
                if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                    // On charge l'utilisateur depuis la base de données
                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                    // On crée le "Badge" d'accès officiel pour Spring Security
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());

                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // On dit à Spring Security : "C'est bon, il a le droit d'entrer !"
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        } catch (Exception e) {
            // Si le token est expiré ou invalide, on ne crash pas, on l'affiche juste dans la console
            System.err.println("Impossible d'authentifier l'utilisateur : " + e.getMessage());
        }

        // On laisse passer la requête au prochain filtre
        filterChain.doFilter(request, response);
    }

    // Petite fonction pour nettoyer la chaîne et enlever le "Bearer "
    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        if (headerAuth != null && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        return null;
    }
}
package com.saas.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        try {
            // 1. On essaie de récupérer le Token dans la requête
            String jwt = parseJwt(request);

            // 2. Si on a un Token et qu'il est valide (pas faux, pas expiré)
            if (jwt != null && jwtUtils.validateToken(jwt)) {

                // On extrait l'email du Token
                String email = jwtUtils.getEmailFromToken(jwt);

                // On charge le profil de l'utilisateur depuis la base
                UserDetails userDetails = customUserDetailsService.loadUserByUsername(email);

                // On crée le "Pass" officiel de sécurité
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // On donne le Pass au videur de Spring Security : "C'est bon, laisse-le passer !"
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            System.out.println("Impossible de définir l'authentification de l'utilisateur : " + e.getMessage());
        }

        // On laisse la requête continuer son chemin
        filterChain.doFilter(request, response);
    }

    /**
     * Petite méthode pour extraire le Token de l'en-tête HTTP
     * Convention standard : le token est caché dans un header "Authorization" et commence par "Bearer "
     */
    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7); // On coupe les 7 premiers caractères ("Bearer ")
        }
        return null;
    }
}
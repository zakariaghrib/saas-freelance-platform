package com.saas.backend.security;

import com.saas.backend.entity.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {

    // 1. La "Signature" indétectable de notre videur (Générée aléatoirement à chaque démarrage)
    private final Key key = Keys.secretKeyFor(SignatureAlgorithm.HS256);

    // 2. La durée de validité du bracelet : 24 heures (en millisecondes)
    private final int jwtExpirationMs = 86400000;

    /**
     * FABRIQUER LE BRACELET (Générer le Token)
     */
    public String generateToken(User user) {
        return Jwts.builder()
                .setSubject(user.getEmail()) // L'identifiant principal (Email)
                .claim("role", user.getRole()) // On note son rôle (FREELANCER ou CLIENT)
                .claim("fullName", user.getNomComplet()) // On note son nom pour le Frontend
                .setIssuedAt(new Date()) // Date et heure de création
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs)) // Expire demain
                .signWith(key) // On scelle le bracelet avec notre clé secrète
                .compact();
    }

    /**
     * LIRE LE BRACELET (Extraire l'email)
     */
    public String getEmailFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    /**
     * VÉRIFIER LE BRACELET (Est-il faux ou expiré ?)
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true; // Le bracelet est valide !
        } catch (Exception e) {
            System.out.println("Bracelet invalide ou expiré : " + e.getMessage());
        }
        return false; // Faux bracelet ou expiré
    }
}
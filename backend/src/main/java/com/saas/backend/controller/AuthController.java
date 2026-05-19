package com.saas.backend.controller;

import com.saas.backend.entity.User;
import com.saas.backend.repository.UserRepository;
import com.saas.backend.security.JwtUtils; // NOUVEAU : Importation de votre usine à Tokens
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils; // NOUVEAU : Injection de JwtUtils

    // --- 1. LA ROUTE DE CONNEXION ---
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("Erreur : Utilisateur non trouvé."));

        // CORRECTION ICI : On utilise JwtUtils pour fabriquer le VRAI Token
        String jwt = jwtUtils.generateToken(user);

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("token", jwt);
        responseBody.put("role", user.getRole());
        responseBody.put("nom", user.getNomComplet());

        return ResponseEntity.ok(responseBody);
    }

    // --- 2. LA ROUTE D'INSCRIPTION ---
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        // On vérifie si l'email est déjà pris
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Erreur : Cet email est déjà utilisé !");
        }

        // On crypte le mot de passe pour que le Login fonctionne plus tard !
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Si aucun rôle n'est choisi, on met CLIENT par défaut
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("CLIENT");
        }

        userRepository.save(user);

        return ResponseEntity.ok("Utilisateur inscrit avec succès !");
    }
}

// Classe utilitaire pour le Login
class LoginRequest {
    private String email;
    private String password;
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
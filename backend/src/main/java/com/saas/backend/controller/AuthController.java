package com.saas.backend.controller;

import com.saas.backend.entity.User;
import com.saas.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Permet au futur Frontend de communiquer avec l'API
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        // 1. Vérification de l'existence de l'email
        if (userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body("Erreur : Cet email est déjà utilisé !");
        }

        // 2. Hachage du mot de passe (SÉCURITÉ)
        // On ne stocke JAMAIS "password123" en clair
        String originalPassword = user.getPassword();
        String hashedPassword = passwordEncoder.encode(originalPassword);
        user.setPassword(hashedPassword);

        // 3. Sauvegarde en base de données
        userRepository.save(user);

        return ResponseEntity.ok("Utilisateur créé avec succès ! Le mot de passe a été sécurisé avec BCrypt.");
    }
}
package com.saas.backend.controller;

import com.saas.backend.dto.LoginRequest;
import com.saas.backend.entity.User;
import com.saas.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Indispensable pour la connexion avec React
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Endpoint pour l'inscription d'un nouvel utilisateur
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        // 1. Vérification de l'unicité de l'email
        if (userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body("Erreur : Cet email est déjà utilisé !");
        }

        // 2. Sécurisation du mot de passe avec BCrypt
        String hashedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(hashedPassword);

        // 3. Enregistrement en base de données
        userRepository.save(user);

        return ResponseEntity.ok("Utilisateur créé avec succès !");
    }

    /**
     * Endpoint pour la connexion (Login)
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        // 1. Recherche de l'utilisateur par email
        Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());

        if (userOptional.isPresent()) {
            User user = userOptional.get();

            // 2. Comparaison du mot de passe saisi avec le hash stocké
            if (passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
                // Succès : Pour l'instant on renvoie un message simple
                // Plus tard, nous renverrons un Token JWT ici
                return ResponseEntity.ok("Connexion réussie ! Bienvenue " + user.getFullName());
            } else {
                // Erreur de mot de passe
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Erreur : Mot de passe incorrect.");
            }
        } else {
            // L'utilisateur n'existe pas
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Erreur : Aucun compte trouvé avec cet email.");
        }
    }
}
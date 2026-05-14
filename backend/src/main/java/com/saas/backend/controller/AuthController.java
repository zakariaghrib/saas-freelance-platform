package com.saas.backend.controller;

import com.saas.backend.entity.User;
import com.saas.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        // Vérifier si l'email existe déjà
        if(userRepository.existsByEmail(user.getEmail())){
            return ResponseEntity.badRequest().body("Erreur : Cet email est déjà utilisé !");
        }

        // Note : Plus tard, nous hacherons le mot de passe ici avant de sauvegarder

        userRepository.save(user);
        return ResponseEntity.ok("Utilisateur créé avec succès !");
    }
}
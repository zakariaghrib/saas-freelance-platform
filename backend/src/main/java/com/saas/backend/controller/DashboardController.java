package com.saas.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    // Cette route est automatiquement protégée par notre Filtre JWT !
    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats() {
        // On simule des données secrètes qui viennent de la base de données
        Map<String, Object> stats = new HashMap<>();
        stats.put("message", "Félicitations, vous avez franchi la sécurité JWT avec succès ! 🚀");
        stats.put("chiffreAffaires", "12 500 MAD");
        stats.put("nouveauxClients", 4);

        return ResponseEntity.ok(stats);
    }
}
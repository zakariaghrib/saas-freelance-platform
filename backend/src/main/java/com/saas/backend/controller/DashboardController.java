package com.saas.backend.controller;

import com.saas.backend.repository.ClientRepository;
import com.saas.backend.repository.FactureRepository;
import org.springframework.beans.factory.annotation.Autowired;
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

    @Autowired
    private ClientRepository clientRepository;

    @Autowired
    private FactureRepository factureRepository;

    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        // 1. Récupération réelle du nombre de clients
        long totalClients = clientRepository.count();

        // 2. Récupération réelle du Chiffre d'Affaires (Factures payées uniquement)
        Double totalPaye = factureRepository.sumMontantByStatutPayee();

        // Sécurité pour éviter d'envoyer 'null' si aucune facture n'est encore payée
        if (totalPaye == null) {
            totalPaye = 0.0;
        }

        stats.put("message", "Statistiques mises à jour en temps réel ! 🚀");

        // 3. Formatage du montant pour l'affichage (ex: 3000.00 MAD)
        stats.put("chiffreAffaires", String.format("%.2f MAD", totalPaye));

        // 4. Nombre total de clients
        stats.put("nouveauxClients", totalClients);

        return ResponseEntity.ok(stats);
    }
}
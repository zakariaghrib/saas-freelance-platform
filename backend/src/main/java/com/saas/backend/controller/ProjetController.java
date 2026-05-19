package com.saas.backend.controller;

import com.saas.backend.entity.Projet;
import com.saas.backend.entity.User;
import com.saas.backend.repository.ProjetRepository;
import com.saas.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projets")
@CrossOrigin(origins = "*")
public class ProjetController {

    @Autowired
    private ProjetRepository projetRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Projet>> getAllProjets() {
        return ResponseEntity.ok(projetRepository.findAll());
    }

    @GetMapping("/mon-projet")
    public ResponseEntity<List<Projet>> getClientProjet(@RequestParam String email) {
        return ResponseEntity.ok(projetRepository.findByClientEmail(email));
    }

    @PostMapping
    public ResponseEntity<?> createProjet(@RequestBody Map<String, String> payload) {
        try {
            String email = payload.get("clientEmail");
            User client = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Client non trouvé."));

            Projet projet = new Projet();
            projet.setTitre(payload.get("titre"));
            projet.setDescription(payload.get("description"));
            projet.setAvancement(0);
            projet.setStatut("EN_COURS");
            projet.setClient(client);

            return ResponseEntity.ok(projetRepository.save(projet));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erreur : " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProjet(@PathVariable Long id, @RequestBody Projet projetDetails) {
        return projetRepository.findById(id)
                .map(projet -> {
                    projet.setTitre(projetDetails.getTitre());
                    projet.setDescription(projetDetails.getDescription());
                    projet.setAvancement(projetDetails.getAvancement());
                    projet.setStatut(projetDetails.getStatut());
                    return ResponseEntity.ok(projetRepository.save(projet));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProjet(@PathVariable Long id) {
        return projetRepository.findById(id)
                .map(projet -> {
                    projetRepository.delete(projet);
                    return ResponseEntity.ok("Projet supprimé.");
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // --- NOUVELLES FONCTIONNALITÉS ---

    @GetMapping("/freelancers")
    public ResponseEntity<List<User>> getFreelancers() {
        return ResponseEntity.ok(userRepository.findAll().stream()
                .filter(u -> "FREELANCER".equals(u.getRole()))
                .toList());
    }

    @PutMapping("/{projetId}/assigner/{freelancerId}")
    public ResponseEntity<?> assignerFreelancer(@PathVariable Long projetId, @PathVariable Long freelancerId) {
        Projet projet = projetRepository.findById(projetId).orElseThrow();
        User freelancer = userRepository.findById(freelancerId).orElseThrow();

        projet.setFreelancer(freelancer);
        projet.setStatutDemande("EN_ATTENTE");
        return ResponseEntity.ok(projetRepository.save(projet));
    }

    @PutMapping("/{projetId}/reponse")
    public ResponseEntity<?> reponseFreelancer(@PathVariable Long projetId, @RequestParam String reponse) {
        Projet projet = projetRepository.findById(projetId).orElseThrow();
        if ("ACCEPTE".equals(reponse)) {
            projet.setStatutDemande("ACCEPTE");
            projet.setStatut("EN_COURS");
        } else {
            projet.setStatutDemande("REFUSE");
            projet.setFreelancer(null);
        }
        return ResponseEntity.ok(projetRepository.save(projet));
    }
}
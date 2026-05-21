package com.saas.backend.controller;

import com.saas.backend.entity.Projet;
import com.saas.backend.entity.User;
import com.saas.backend.entity.Tache;
import com.saas.backend.entity.Message;
import com.saas.backend.repository.ProjetRepository;
import com.saas.backend.repository.UserRepository;
import com.saas.backend.repository.TacheRepository;
import com.saas.backend.repository.MessageRepository;
import com.saas.backend.service.PdfService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projets")
public class ProjetController {

    @Autowired
    private ProjetRepository projetRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TacheRepository tacheRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private PdfService pdfService;

    // ==========================================
    // --- GESTION DE BASE DES PROJETS ---
    // ==========================================

    @GetMapping
    public ResponseEntity<List<Projet>> getAllProjets() {
        return ResponseEntity.ok(projetRepository.findAll());
    }

    @GetMapping("/mon-projet")
    public ResponseEntity<List<Projet>> getClientProjet(@RequestParam String email) {
        return ResponseEntity.ok(projetRepository.findByClientEmail(email));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Projet> getProjetById(@PathVariable Long id) {
        return projetRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
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

    // ==========================================
    // --- ASSIGNATION ET RÉPONSES FREELANCER ---
    // ==========================================

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

    @PutMapping("/{projetId}/duree")
    public ResponseEntity<?> definirDuree(@PathVariable Long projetId, @RequestParam Integer jours) {
        Projet projet = projetRepository.findById(projetId).orElseThrow();
        projet.setDureeJours(jours);
        return ResponseEntity.ok(projetRepository.save(projet));
    }

    // ==========================================
    // --- TÂCHES ET MESSAGERIE ---
    // ==========================================

    @GetMapping("/{projetId}/taches")
    public ResponseEntity<List<Tache>> getTachesByProjet(@PathVariable Long projetId) {
        Projet projet = projetRepository.findById(projetId).orElseThrow();
        return ResponseEntity.ok(tacheRepository.findByProjet(projet));
    }

    @PostMapping("/{projetId}/taches")
    public ResponseEntity<?> createTache(@PathVariable Long projetId, @RequestBody Tache tache) {
        Projet projet = projetRepository.findById(projetId).orElseThrow();
        tache.setProjet(projet);
        return ResponseEntity.ok(tacheRepository.save(tache));
    }

    @PutMapping("/taches/{tacheId}")
    public ResponseEntity<?> updateTache(@PathVariable Long tacheId, @RequestBody Tache tacheDetails) {
        return tacheRepository.findById(tacheId).map(tache -> {
            tache.setTerminee(tacheDetails.isTerminee());
            return ResponseEntity.ok(tacheRepository.save(tache));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{projetId}/messages")
    public ResponseEntity<List<Message>> getMessagesByProjet(@PathVariable Long projetId) {
        Projet projet = projetRepository.findById(projetId).orElseThrow();
        return ResponseEntity.ok(messageRepository.findByProjetOrderByDateEnvoiAsc(projet));
    }

    @PostMapping("/{projetId}/messages")
    public ResponseEntity<?> createMessage(@PathVariable Long projetId, @RequestBody Message message) {
        Projet projet = projetRepository.findById(projetId).orElseThrow();
        message.setProjet(projet);
        message.setDateEnvoi(LocalDateTime.now());
        return ResponseEntity.ok(messageRepository.save(message));
    }

    // ==========================================
    // --- FACTURATION ET GÉNÉRATION PDF ---
    // ==========================================

    // NOUVEAU : Envoyer la facture avec le prix défini
    @PutMapping("/{projetId}/facturer")
    public ResponseEntity<?> envoyerFacture(@PathVariable Long projetId, @RequestParam Double prix) {
        Projet projet = projetRepository.findById(projetId).orElseThrow();
        projet.setPrix(prix);
        projet.setFactureEnvoyee(true);
        return ResponseEntity.ok(projetRepository.save(projet));
    }

    @GetMapping("/{projetId}/facture/pdf")
    public ResponseEntity<byte[]> telechargerFacturePdf(@PathVariable Long projetId) {
        Projet projet = projetRepository.findById(projetId).orElseThrow();

        byte[] pdfBytes = pdfService.genererFacturePdf(projet);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "Facture_Projet_" + projetId + ".pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }
}
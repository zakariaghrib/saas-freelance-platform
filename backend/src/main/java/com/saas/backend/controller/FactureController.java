package com.saas.backend.controller;

import com.saas.backend.entity.Facture;
import com.saas.backend.repository.FactureRepository;
import com.saas.backend.repository.ClientRepository;
import com.saas.backend.service.FacturePdfService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/factures")
@CrossOrigin(origins = "*")
public class FactureController {

    @Autowired
    private FactureRepository factureRepository;

    @Autowired
    private ClientRepository clientRepository;

    // Injection du nouveau service PDF
    @Autowired
    private FacturePdfService facturePdfService;

    /**
     * 1. RÉCUPÉRER TOUTES LES FACTURES
     * Route : GET /api/factures
     */
    @GetMapping
    public ResponseEntity<List<Facture>> getAllFactures() {
        return ResponseEntity.ok(factureRepository.findAll());
    }

    /**
     * 2. CRÉER UNE NOUVELLE FACTURE
     * Route : POST /api/factures
     */
    @PostMapping
    public ResponseEntity<?> createFacture(@RequestBody Facture facture) {
        // Vérification de la présence du client dans la requête
        if (facture.getClient() == null || facture.getClient().getId() == null) {
            return ResponseEntity.badRequest().body("Erreur : La facture doit être rattachée à un client.");
        }

        // Vérification de l'existence réelle du client en base de données
        if (!clientRepository.existsById(facture.getClient().getId())) {
            return ResponseEntity.badRequest().body("Erreur : Le client spécifié n'existe pas.");
        }

        Facture savedFacture = factureRepository.save(facture);
        return ResponseEntity.ok(savedFacture);
    }

    /**
     * 3. MODIFIER UNE FACTURE EXISTANTE (Cycle de vie)
     * Route : PUT /api/factures/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateFacture(@PathVariable Long id, @RequestBody Facture factureDetails) {
        // Vérification de la relation client
        if (factureDetails.getClient() == null || factureDetails.getClient().getId() == null) {
            return ResponseEntity.badRequest().body("Erreur : La facture doit être rattachée à un client.");
        }

        if (!clientRepository.existsById(factureDetails.getClient().getId())) {
            return ResponseEntity.badRequest().body("Erreur : Le client spécifié n'existe pas.");
        }

        return factureRepository.findById(id)
                .map(facture -> {
                    // Mise à jour des informations
                    facture.setReference(factureDetails.getReference());
                    facture.setMontant(factureDetails.getMontant());
                    facture.setStatut(factureDetails.getStatut());
                    facture.setClient(factureDetails.getClient());

                    Facture updatedFacture = factureRepository.save(facture);
                    return ResponseEntity.ok(updatedFacture);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * 4. SUPPRIMER UNE FACTURE
     * Route : DELETE /api/factures/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFacture(@PathVariable Long id) {
        if (!factureRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        factureRepository.deleteById(id);
        return ResponseEntity.ok("Facture supprimée avec succès.");
    }

    /**
     * 5. GÉNÉRER ET TÉLÉCHARGER LE PDF D'UNE FACTURE
     * Route : GET /api/factures/{id}/pdf
     */
    @GetMapping("/{id}/pdf")
    public void generatePdf(@PathVariable Long id, HttpServletResponse response) throws IOException {
        // 1. On cherche la facture dans la base de données
        Facture facture = factureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Facture introuvable avec l'ID : " + id));

        // 2. On configure la réponse HTTP pour forcer le téléchargement du fichier PDF
        response.setContentType("application/pdf");

        // Formatage de la date pour le nom du fichier
        DateFormat dateFormatter = new SimpleDateFormat("yyyy-MM-dd");
        String currentDateTime = dateFormatter.format(new Date());

        // Création de l'en-tête pour forcer le navigateur à télécharger (attachment)
        String headerKey = "Content-Disposition";
        String headerValue = "attachment; filename=facture_" + facture.getReference() + "_" + currentDateTime + ".pdf";
        response.setHeader(headerKey, headerValue);

        // 3. On demande au Service de dessiner le PDF et de l'envoyer dans la réponse
        facturePdfService.export(response, facture);
    }
}
package com.saas.backend.controller;

import com.saas.backend.entity.Client;
import com.saas.backend.repository.ClientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clients")
@CrossOrigin(origins = "*") // Permet au frontend React de communiquer avec l'API
public class ClientController {

    @Autowired
    private ClientRepository clientRepository;

    /**
     * 1. RÉCUPÉRER TOUS LES CLIENTS
     * Route : GET /api/clients
     */
    @GetMapping
    public ResponseEntity<List<Client>> getAllClients() {
        List<Client> clients = clientRepository.findAll();
        return ResponseEntity.ok(clients);
    }

    /**
     * 2. AJOUTER UN NOUVEAU CLIENT
     * Route : POST /api/clients
     */
    @PostMapping
    public ResponseEntity<?> createClient(@RequestBody Client client) {
        // Vérifie si l'email est déjà utilisé
        if (clientRepository.existsByEmail(client.getEmail())) {
            return ResponseEntity.badRequest().body("Un client avec cet email existe déjà.");
        }

        // Sauvegarde le client avec la date de création générée automatiquement
        Client savedClient = clientRepository.save(client);
        return ResponseEntity.ok(savedClient);
    }

    /**
     * 3. MODIFIER UN CLIENT EXISTANT
     * Route : PUT /api/clients/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateClient(@PathVariable Long id, @RequestBody Client clientDetails) {
        return clientRepository.findById(id)
                .map(client -> {
                    // Mise à jour des champs
                    client.setNomComplet(clientDetails.getNomComplet());
                    client.setEmail(clientDetails.getEmail());
                    client.setEntreprise(clientDetails.getEntreprise());
                    client.setTelephone(clientDetails.getTelephone());

                    // Sauvegarde des modifications
                    Client updatedClient = clientRepository.save(client);
                    return ResponseEntity.ok(updatedClient);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * 4. SUPPRIMER UN CLIENT
     * Route : DELETE /api/clients/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteClient(@PathVariable Long id) {
        if (!clientRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        clientRepository.deleteById(id);
        return ResponseEntity.ok("Client supprimé avec succès.");
    }
}
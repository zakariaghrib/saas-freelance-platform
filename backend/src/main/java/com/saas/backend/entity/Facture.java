package com.saas.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "factures")
public class Facture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String reference; // Exemple: FAC-2026-001

    @Column(nullable = false)
    private Double montant;

    @Column(nullable = false)
    private String statut; // "EN_ATTENTE", "PAYEE", "ANNULEE"

    @Column(updatable = false)
    private LocalDateTime dateCreation;

    // --- LA RELATION MAGIQUE ---
    // @ManyToOne indique que plusieurs factures sont liées à un seul client
    // @JoinColumn crée une colonne 'client_id' dans la table 'factures' (Clé étrangère)
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @PrePersist
    protected void onCreate() {
        this.dateCreation = LocalDateTime.now();
    }

    // --- Constructeurs ---
    public Facture() {}

    public Facture(String reference, Double montant, String statut, Client client) {
        this.reference = reference;
        this.montant = montant;
        this.statut = statut;
        this.client = client;
    }

    // --- Getters et Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }

    public Double getMontant() { return montant; }
    public void setMontant(Double montant) { this.montant = montant; }

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }

    public LocalDateTime getDateCreation() { return dateCreation; }

    public Client getClient() { return client; }
    public void setClient(Client client) { this.client = client; }
}
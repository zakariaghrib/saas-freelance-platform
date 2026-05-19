package com.saas.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "projets")
public class Projet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titre;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private int avancement = 0;

    @Column(nullable = false)
    private String statut = "EN_COURS";

    @ManyToOne
    @JoinColumn(name = "client_id", nullable = false)
    private User client;

    // --- Nouveaux champs pour l'association ---
    @ManyToOne
    @JoinColumn(name = "freelancer_id", nullable = true)
    private User freelancer;

    @Column(name = "statut_demande")
    private String statutDemande; // "EN_ATTENTE", "ACCEPTE", "REFUSE"

    // --- Constructeurs ---
    public Projet() {}

    // --- Getters et Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public int getAvancement() { return avancement; }
    public void setAvancement(int avancement) { this.avancement = avancement; }

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }

    public User getClient() { return client; }
    public void setClient(User client) { this.client = client; }

    public User getFreelancer() { return freelancer; }
    public void setFreelancer(User freelancer) { this.freelancer = freelancer; }

    public String getStatutDemande() { return statutDemande; }
    public void setStatutDemande(String statutDemande) { this.statutDemande = statutDemande; }
}
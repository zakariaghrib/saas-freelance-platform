package com.saas.backend.entity;

import jakarta.persistence.*;

@Entity
public class Projet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titre;

    @Column(length = 1000)
    private String description;

    private Integer avancement = 0;
    private String statut = "EN_COURS"; // EN_COURS, TERMINE, EN_PAUSE

    // Le nombre de jours estimé pour le projet
    @Column(name = "duree_jours")
    private Integer dureeJours;

    // Statut de la demande avec le Freelancer (EN_ATTENTE, ACCEPTE, REFUSE)
    private String statutDemande;

    // NOUVEAU : Gestion de la facturation
    private Double prix;
    private boolean factureEnvoyee = false;

    @ManyToOne
    @JoinColumn(name = "client_id")
    private User client;

    @ManyToOne
    @JoinColumn(name = "freelancer_id")
    private User freelancer;

    // --- Getters et Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getAvancement() { return avancement; }
    public void setAvancement(Integer avancement) { this.avancement = avancement; }

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }

    public Integer getDureeJours() { return dureeJours; }
    public void setDureeJours(Integer dureeJours) { this.dureeJours = dureeJours; }

    public String getStatutDemande() { return statutDemande; }
    public void setStatutDemande(String statutDemande) { this.statutDemande = statutDemande; }

    public Double getPrix() { return prix; }
    public void setPrix(Double prix) { this.prix = prix; }

    public boolean isFactureEnvoyee() { return factureEnvoyee; }
    public void setFactureEnvoyee(boolean factureEnvoyee) { this.factureEnvoyee = factureEnvoyee; }

    public User getClient() { return client; }
    public void setClient(User client) { this.client = client; }

    public User getFreelancer() { return freelancer; }
    public void setFreelancer(User freelancer) { this.freelancer = freelancer; }
}
package com.saas.backend.entity;

import jakarta.persistence.*;

@Entity
public class Tache {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titre;
    private boolean terminee = false;

    // NOUVEAU : Le jour spécifique auquel cette tâche est assignée (ex: Jour 1, Jour 2)
    private Integer jour;

    @ManyToOne
    @JoinColumn(name = "projet_id")
    private Projet projet;

    // --- Getters et Setters ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public boolean isTerminee() { return terminee; }
    public void setTerminee(boolean terminee) { this.terminee = terminee; }

    public Integer getJour() { return jour; }
    public void setJour(Integer jour) { this.jour = jour; }

    public Projet getProjet() { return projet; }
    public void setProjet(Projet projet) { this.projet = projet; }
}
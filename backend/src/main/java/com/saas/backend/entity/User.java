package com.saas.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "users") // Le nom de la table dans PostgreSQL
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nomComplet;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    // --- LA NOUVEAUTÉ EST ICI : LE RÔLE ---
    // Par défaut, toute personne qui s'inscrit est un CLIENT
    @Column(nullable = false)
    private String role = "CLIENT";

    // --- Constructeurs ---
    public User() {
    }

    public User(String nomComplet, String email, String password, String role) {
        this.nomComplet = nomComplet;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    // --- Getters et Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNomComplet() { return nomComplet; }
    public void setNomComplet(String nomComplet) { this.nomComplet = nomComplet; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
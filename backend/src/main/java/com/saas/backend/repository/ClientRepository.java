package com.saas.backend.repository;

import com.saas.backend.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
    // JpaRepository nous offre déjà save(), findAll(), findById(), deleteById()... magie !

    // On peut rajouter une méthode personnalisée au cas où :
    boolean existsByEmail(String email);
}
package com.saas.backend.repository;

import com.saas.backend.entity.Projet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjetRepository extends JpaRepository<Projet, Long> {

    // Retrouver tous les projets d'un client grâce à son email
    List<Projet> findByClientEmail(String email);
}
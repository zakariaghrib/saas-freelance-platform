package com.saas.backend.repository;

import com.saas.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Vérifier si un email est déjà pris lors de l'inscription
    boolean existsByEmail(String email);

    // Rechercher un utilisateur par son email pour la connexion
    Optional<User> findByEmail(String email);
}
package com.saas.backend.repository;

import com.saas.backend.entity.Projet;
import com.saas.backend.entity.Tache;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TacheRepository extends JpaRepository<Tache, Long> {
    List<Tache> findByProjet(Projet projet);
}
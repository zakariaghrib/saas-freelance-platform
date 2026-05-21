package com.saas.backend.repository;

import com.saas.backend.entity.Projet;
import com.saas.backend.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByProjetOrderByDateEnvoiAsc(Projet projet);
}
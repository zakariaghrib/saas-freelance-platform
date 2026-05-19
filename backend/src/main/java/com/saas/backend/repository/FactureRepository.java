package com.saas.backend.repository;

import com.saas.backend.entity.Facture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FactureRepository extends JpaRepository<Facture, Long> {

    // Récupérer les factures d'un client spécifique
    List<Facture> findByClientId(Long clientId);

    /**
     * Calcule la somme totale des montants pour toutes les factures payées.
     * On utilise JPQL (Java Persistence Query Language) ici.
     */
    @Query("SELECT SUM(f.montant) FROM Facture f WHERE f.statut = 'PAYEE'")
    Double sumMontantByStatutPayee();
}
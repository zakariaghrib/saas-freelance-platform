package com.saas.backend.service;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.*;
import com.lowagie.text.pdf.draw.LineSeparator;
import com.saas.backend.entity.Facture;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.IOException;

@Service
public class FacturePdfService {

    public void export(HttpServletResponse response, Facture facture) throws IOException {
        // 1. Création du document avec de belles marges
        Document document = new Document(PageSize.A4, 50, 50, 50, 50);
        PdfWriter.getInstance(document, response.getOutputStream());
        document.open();

        // --- PALETTE DE COULEURS ---
        Color primaryColor = new Color(15, 23, 42); // Bleu nuit / Ardoise foncée
        Color grayColor = new Color(100, 116, 139); // Gris texte
        Color lightBg = new Color(248, 250, 252); // Fond gris très clair
        Color borderColor = new Color(226, 232, 240); // Gris bordure

        // --- POLICES ---
        Font fontLogo = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 26, primaryColor);
        Font fontHeader = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, primaryColor);
        Font fontSubHeader = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, primaryColor);
        Font fontNormal = FontFactory.getFont(FontFactory.HELVETICA, 11, primaryColor);
        Font fontGray = FontFactory.getFont(FontFactory.HELVETICA, 10, grayColor);
        Font fontTableHead = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11, Color.WHITE);

        // --- EN-TÊTE (SAASFLOW & RÉFÉRENCE) ---
        // On utilise un tableau invisible pour aligner à gauche et à droite
        PdfPTable headerTable = new PdfPTable(2);
        headerTable.setWidthPercentage(100);
        headerTable.setWidths(new float[]{1f, 1f});

        // Gauche : Logo / Nom entreprise
        PdfPCell companyCell = new PdfPCell();
        companyCell.setBorder(Rectangle.NO_BORDER);
        companyCell.addElement(new Paragraph("SAASFLOW", fontLogo));
        companyCell.addElement(new Paragraph("Votre plateforme de gestion", fontGray));
        headerTable.addCell(companyCell);

        // Droite : Informations Facture
        PdfPCell invoiceCell = new PdfPCell();
        invoiceCell.setBorder(Rectangle.NO_BORDER);
        Paragraph titreFacture = new Paragraph("FACTURE", fontHeader);
        titreFacture.setAlignment(Element.ALIGN_RIGHT);
        invoiceCell.addElement(titreFacture);

        Paragraph refFacture = new Paragraph("Réf : " + facture.getReference(), fontNormal);
        refFacture.setAlignment(Element.ALIGN_RIGHT);
        invoiceCell.addElement(refFacture);

        // Date
        Paragraph dateFacture = new Paragraph("Date : " + java.time.LocalDate.now().toString(), fontGray);
        dateFacture.setAlignment(Element.ALIGN_RIGHT);
        invoiceCell.addElement(dateFacture);

        headerTable.addCell(invoiceCell);
        document.add(headerTable);
        document.add(new Paragraph("\n"));

        // --- LIGNE DE SÉPARATION ---
        LineSeparator ls = new LineSeparator();
        ls.setLineColor(borderColor);
        document.add(new Chunk(ls));
        document.add(new Paragraph("\n\n"));

        // --- INFORMATIONS DU CLIENT ---
        // On met les infos dans un encart avec un fond légèrement teinté
        PdfPTable clientTable = new PdfPTable(1);
        clientTable.setWidthPercentage(50); // Prend la moitié de la page
        clientTable.setHorizontalAlignment(Element.ALIGN_LEFT);

        PdfPCell clientCell = new PdfPCell();
        clientCell.setBorderColor(borderColor);
        clientCell.setBackgroundColor(lightBg);
        clientCell.setPadding(15);
        clientCell.addElement(new Paragraph("Facturé à :", fontGray));
        clientCell.addElement(new Paragraph(facture.getClient().getNomComplet(), fontSubHeader));

        if (facture.getClient().getEntreprise() != null && !facture.getClient().getEntreprise().isEmpty()) {
            clientCell.addElement(new Paragraph(facture.getClient().getEntreprise(), fontNormal));
        }
        clientCell.addElement(new Paragraph(facture.getClient().getEmail(), fontNormal));

        clientTable.addCell(clientCell);
        document.add(clientTable);
        document.add(new Paragraph("\n\n"));

        // --- TABLEAU DES PRESTATIONS ---
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{3f, 1f}); // La colonne description est 3x plus grande

        // En-tête du tableau
        PdfPCell hCell1 = new PdfPCell(new Phrase("Description", fontTableHead));
        hCell1.setBackgroundColor(primaryColor);
        hCell1.setPadding(10);
        hCell1.setBorderColor(Color.WHITE);
        table.addCell(hCell1);

        PdfPCell hCell2 = new PdfPCell(new Phrase("Montant", fontTableHead));
        hCell2.setBackgroundColor(primaryColor);
        hCell2.setPadding(10);
        hCell2.setBorderColor(Color.WHITE);
        hCell2.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(hCell2);

        // Ligne de prestation
        PdfPCell rCell1 = new PdfPCell(new Phrase("Prestation de services (Développement / Licence)", fontNormal));
        rCell1.setPadding(12);
        rCell1.setBorderColor(borderColor);
        table.addCell(rCell1);

        // Formatage du montant avec 2 décimales
        String montantFormatte = String.format("%.2f MAD", facture.getMontant());
        PdfPCell rCell2 = new PdfPCell(new Phrase(montantFormatte, fontSubHeader));
        rCell2.setPadding(12);
        rCell2.setBorderColor(borderColor);
        rCell2.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(rCell2);

        document.add(table);
        document.add(new Paragraph("\n\n"));

        // --- STATUT DE LA FACTURE ---
        // Choix de la couleur selon le statut
        Color statusColor;
        switch (facture.getStatut()) {
            case "PAYEE": statusColor = new Color(34, 197, 94); break; // Vert
            case "EN_ATTENTE": statusColor = new Color(245, 158, 11); break; // Orange
            default: statusColor = new Color(239, 68, 68); // Rouge
        }

        Font fontStatus = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, statusColor);
        Paragraph statutPara = new Paragraph("STATUT : " + facture.getStatut(), fontStatus);
        statutPara.setAlignment(Element.ALIGN_RIGHT); // Aligné à droite sous le montant
        document.add(statutPara);

        // --- PIED DE PAGE ---
        document.add(new Paragraph("\n\n\n\n\n\n")); // On pousse vers le bas
        Paragraph footer = new Paragraph("Merci de votre confiance. Ce document est généré automatiquement par SaaSflow.", fontGray);
        footer.setAlignment(Element.ALIGN_CENTER);
        document.add(footer);

        document.close();
    }
}
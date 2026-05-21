package com.saas.backend.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.saas.backend.entity.Projet;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
public class PdfService {

    public byte[] genererFacturePdf(Projet projet) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            // Création du document
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, out);
            document.open();

            // Polices
            Font fontTitre = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22);
            Font fontSousTitre = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
            Font fontTexte = FontFactory.getFont(FontFactory.HELVETICA, 12);

            // En-tête : Titre de la facture
            Paragraph titre = new Paragraph("FACTURE PROFORMA", fontTitre);
            titre.setAlignment(Element.ALIGN_CENTER);
            titre.setSpacingAfter(30);
            document.add(titre);

            // Informations générales
            document.add(new Paragraph("Date : " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")), fontTexte));
            document.add(new Paragraph("Référence Projet : PRJ-" + projet.getId(), fontTexte));
            document.add(new Paragraph("Titre du projet : " + projet.getTitre(), fontTexte));

            document.add(Chunk.NEWLINE);

            // Informations Client et Freelancer
            PdfPTable tableInfo = new PdfPTable(2);
            tableInfo.setWidthPercentage(100);
            tableInfo.setSpacingAfter(30);

            PdfPCell cellClient = new PdfPCell();
            cellClient.setBorder(Rectangle.NO_BORDER);
            cellClient.addElement(new Paragraph("FACTURÉ À :", fontSousTitre));
            cellClient.addElement(new Paragraph(projet.getClient() != null ? projet.getClient().getEmail() : "Client Inconnu", fontTexte));

            PdfPCell cellFreelancer = new PdfPCell();
            cellFreelancer.setBorder(Rectangle.NO_BORDER);
            cellFreelancer.addElement(new Paragraph("PRESTATAIRE :", fontSousTitre));
            cellFreelancer.addElement(new Paragraph(projet.getFreelancer() != null ? projet.getFreelancer().getEmail() : "Non assigné", fontTexte));

            tableInfo.addCell(cellClient);
            tableInfo.addCell(cellFreelancer);
            document.add(tableInfo);

            // Tableau des prestations
            PdfPTable tablePrestations = new PdfPTable(3);
            tablePrestations.setWidthPercentage(100);
            tablePrestations.setWidths(new float[]{4f, 2f, 2f});
            tablePrestations.setSpacingAfter(30);

            // En-têtes du tableau
            String[] headers = {"Description de la mission", "Durée estimée", "Statut"};
            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(header, fontSousTitre));
                cell.setPadding(8);
                cell.setBackgroundColor(java.awt.Color.LIGHT_GRAY);
                tablePrestations.addCell(cell);
            }

            // Données du tableau
            tablePrestations.addCell(new PdfPCell(new Phrase(projet.getDescription(), fontTexte)));
            tablePrestations.addCell(new PdfPCell(new Phrase(projet.getDureeJours() != null ? projet.getDureeJours() + " Jours" : "N/A", fontTexte)));
            tablePrestations.addCell(new PdfPCell(new Phrase(projet.getAvancement() == 100 ? "Terminé" : "En cours", fontTexte)));

            document.add(tablePrestations);

            // Total / Avancement final
            Paragraph total = new Paragraph("AVANCEMENT GLOBAL : " + projet.getAvancement() + "%", fontSousTitre);
            total.setAlignment(Element.ALIGN_RIGHT);
            document.add(total);

            // NOUVEAU : Le Prix Total (S'il a été défini)
            document.add(Chunk.NEWLINE);
            if (projet.getPrix() != null) {
                Paragraph totalPrix = new Paragraph("TOTAL À PAYER : " + projet.getPrix() + " MAD", fontTitre);
                totalPrix.setAlignment(Element.ALIGN_RIGHT);
                document.add(totalPrix);
            } else {
                Paragraph totalPrix = new Paragraph("MONTANT NON DÉFINI", fontTitre);
                totalPrix.setAlignment(Element.ALIGN_RIGHT);
                document.add(totalPrix);
            }

            // Message de remerciement
            document.add(Chunk.NEWLINE);
            Paragraph footer = new Paragraph("Merci pour votre confiance. Facture générée via SaaSFlow ERP.", fontTexte);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();

        } catch (Exception e) {
            e.printStackTrace();
        }

        return out.toByteArray();
    }
}
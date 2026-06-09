package com.project.sipms.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;

/**
 * Extracts plain text from CV files (PDF or DOCX).
 * Used by the AI analysis pipeline to feed CV content into the matching algorithm.
 */
@Service
public class CvTextExtractorService {

    /**
     * Extract readable text from a CV file.
     *
     * @param file the uploaded MultipartFile (PDF or DOCX)
     * @return extracted plain text
     * @throws IOException if parsing fails
     * @throws IllegalArgumentException if the file type is unsupported
     */
    public String extractText(MultipartFile file) throws IOException {
        String contentType = file.getContentType();
        String originalFilename = file.getOriginalFilename() != null
                ? file.getOriginalFilename().toLowerCase() : "";

        if (isPdf(contentType, originalFilename)) {
            return extractFromPdf(file.getInputStream());
        } else if (isDocx(contentType, originalFilename)) {
            return extractFromDocx(file.getInputStream());
        } else {
            throw new IllegalArgumentException(
                "Unsupported file type. Please upload a PDF or DOCX file.");
        }
    }

    // ── PDF Extraction ────────────────────────────────────────────────

    private String extractFromPdf(InputStream inputStream) throws IOException {
        try (PDDocument document = PDDocument.load(inputStream)) {
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            return stripper.getText(document);
        }
    }

    // ── DOCX Extraction ──────────────────────────────────────────────

    private String extractFromDocx(InputStream inputStream) throws IOException {
        try (XWPFDocument document = new XWPFDocument(inputStream);
             XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {
            return extractor.getText();
        }
    }

    // ── Type Detection ──────────────────────────────────────────────

    private boolean isPdf(String contentType, String filename) {
        return "application/pdf".equalsIgnoreCase(contentType)
                || filename.endsWith(".pdf");
    }

    private boolean isDocx(String contentType, String filename) {
        return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    .equalsIgnoreCase(contentType)
                || "application/msword".equalsIgnoreCase(contentType)
                || filename.endsWith(".docx")
                || filename.endsWith(".doc");
    }
}

package org.lukaswagner.autoannotator;


import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;


import java.io.File;

public class Main {

    public static void main(String[] args) {
        File file = new File("main.pdf");

        var x = 61.78;
//        var y = 589.75;
        var y = 253.4;

        var width = 143.97;
        var height = 24.49;

        var pageNumber = 7;

        try {
            var document = PDDocument.load(file);
            PDPage page = (PDPage) document.getDocumentCatalog().getPages().get(1);

            System.out.println(page.getMediaBox().getWidth() / 1);
            System.out.println(page.getMediaBox().getHeight() / 1);


            var stripper = new FontStyleExtractor(document, pageNumber, x, y, width, height);
            System.out.println(stripper.getFontStyles());

        }
        catch (Exception e) {
            System.out.println(e);
        }
    }
}

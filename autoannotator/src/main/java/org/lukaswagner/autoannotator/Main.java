package org.lukaswagner.autoannotator;


import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;


import java.io.File;

public class Main {

    public static void main(String[] args) {
        File file = new File("main.pdf");

        var x = 61.78;
        var y = 253.4;

        var width = 143.97;
        var height = 24.49;

        var pageNumber = 7;

        try {
            var document = PDDocument.load(file);
            PDPage page = (PDPage) document.getDocumentCatalog().getPages().get(1);

            System.out.println(page.getMediaBox().getWidth() / 1);
            System.out.println(page.getMediaBox().getHeight() / 1);


            var stripper = new FontStyleExtractor(document, new RegionOfInterest(pageNumber, x, y, width, height));
            var styles = stripper.getFontStyles();

            var style = ((FontStyle) styles.toArray()[0]);

            var roiExtractor = new RegionOfInterestExtractor(document, style);

            var rois = roiExtractor.getRegionsOfInterest();

            for (var roi : rois) {
                System.out.println(roi);
            }

            System.out.println(style.getFontSize());

        }
        catch (Exception e) {
            e.printStackTrace();
        }
    }
}

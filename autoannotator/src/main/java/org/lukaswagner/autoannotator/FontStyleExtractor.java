package org.lukaswagner.autoannotator;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.pdfbox.text.TextPosition;

import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class FontStyleExtractor {
    public FontStyleExtractor(PDDocument document, RegionOfInterest regionOfInterest) {
        this.document = document;
        this.regionOfInterest = regionOfInterest;

    }

    private PDDocument document;
    private RegionOfInterest regionOfInterest;




    public Set<FontStyle> getFontStyles() throws IOException {
        final Set<FontStyle> fontStyles = new HashSet<>();

        var stripper = new PDFTextStripper() {
            @Override
            protected void writeString(String text, List<TextPosition> textPositions) throws IOException
            {
                StringBuilder builder = new StringBuilder();

                for (TextPosition position : textPositions)
                {
                    var currX = position.getX();
                    var currY = position.getY();

                    if (this.getCurrentPageNo() == regionOfInterest.getPageNumber() &&
                            currX > regionOfInterest.getX() && currX < regionOfInterest.getX() + regionOfInterest.getWidth() &&
                            currY > regionOfInterest.getY() && currY < regionOfInterest.getY() + regionOfInterest.getHeight()) {

                        String font = position.getFont().getName();
                        float size = position.getFontSize();

                        fontStyles.add(new FontStyle(font, size));

                    }
                }
            }
        };

        stripper.getText(this.document);

        return fontStyles;
    }
}

package org.lukaswagner.autoannotator;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.pdfbox.text.TextPosition;

import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class FontStyleExtractor {
    public FontStyleExtractor(PDDocument document, int pageNumber, double x, double y, double width, double height) {
        this.document = document;
        this.pageNumber = pageNumber;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    private PDDocument document;
    private int pageNumber;
    private double x;
    private double y;
    private double width;
    private double height;


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

                    if (this.getCurrentPageNo() == pageNumber &&
                            currX > x && currX < x + width &&
                            currY > y && currY < y + height) {

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

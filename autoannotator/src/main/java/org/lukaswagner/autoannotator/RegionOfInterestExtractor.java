package org.lukaswagner.autoannotator;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.pdfbox.text.TextPosition;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class RegionOfInterestExtractor {
    private FontStyle fontStyle;
    private PDDocument document;

    public RegionOfInterestExtractor(PDDocument document, FontStyle fontStyle) {
        this.document = document;
        this.fontStyle = fontStyle;
    }

    public List<RegionOfInterest> getRegionsOfInterest() throws IOException {
        var stripper = new PDFTextStripper() {
            private boolean active = false;
            public List<List<Point>> currentROIPoints = new ArrayList<>();
            private double lastY;

            @Override
            protected void writeString(String text, List<TextPosition> textPositions) throws IOException
            {
                for (TextPosition position : textPositions)
                {
                    var currentFontStyle = new FontStyle(position.getFont().getName(), position.getFontSize());

                    boolean fontMatch = currentFontStyle.equals(RegionOfInterestExtractor.this.fontStyle);

                    var currX = position.getX();
                    var currY = position.getY();

                    if (fontMatch && !active) {
                        // Find first character of new ROI
                        this.currentROIPoints.add(new ArrayList<>());
                        this.currentROIPoints.get(this.currentROIPoints.size() - 1).add(new Point(this.getCurrentPageNo(), currX, currY));
                        active = true;
                    } else if (fontMatch && active) {
                        // Read next character of current ROI
                        if (Double.compare(lastY, currY) != 0) {
                            this.currentROIPoints.add(new ArrayList<>());
                        }

                        this.currentROIPoints.get(this.currentROIPoints.size() - 1).add(new Point(this.getCurrentPageNo(), currX, currY));
                    }
                    else if (!fontMatch && active) {
                        // Leaving ROI
                        active = false;
                    }
                    else {
                        // Outside ROI
                    }

                    lastY = currY;

                }
            }
        };

        stripper.getText(this.document);

        List<RegionOfInterest> rois = new ArrayList<>();

        for (List<Point> list: stripper.currentROIPoints) {
            var xMin = Double.MAX_VALUE;
            var yMin = Double.MAX_VALUE;
            var xMax = Double.MIN_VALUE;
            var yMax = Double.MIN_VALUE;

            var pageNo = list.get(0).getPageNumber();

            for (var point : list) {
                xMin = Math.min(point.getX(), xMin);
                yMin = Math.min(point.getY(), yMin);
                xMax = Math.max(point.getX(), xMax);
                yMax = Math.max(point.getY(), yMax);
            }

            rois.add(new RegionOfInterest(pageNo, xMin, yMin - this.fontStyle.getFontSize(), xMax - xMin + this.fontStyle.getFontSize(),
                    Math.max(this.fontStyle.getFontSize(), yMax - yMin)));
        }

        return rois;
    }
}

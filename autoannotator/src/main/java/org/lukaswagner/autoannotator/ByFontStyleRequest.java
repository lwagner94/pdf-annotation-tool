package org.lukaswagner.autoannotator;

import com.google.gson.Gson;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.eclipse.jetty.util.IO;

import java.io.IOException;
import java.util.List;

public class ByFontStyleRequest {
    public String documentID;
    public RegionOfInterest regionOfInterest;

    public static ByFontStyleRequest fromJSON(String json) {
        Gson gson = new Gson();
        return gson.fromJson(json, ByFontStyleRequest.class);
    }

    public List<RegionOfInterest> getRegionsOfInterest() throws IOException {
        var file = DocumentManager.getDocumentById(this.documentID);
        var document = PDDocument.load(file);

        var stripper = new FontStyleExtractor(document, this.regionOfInterest);
        var styles = stripper.getFontStyles();
        var style = ((FontStyle) styles.toArray()[0]);
        var roiExtractor = new RegionOfInterestExtractor(document, style);
        var rois = roiExtractor.getRegionsOfInterest();

        return rois;
    }
}


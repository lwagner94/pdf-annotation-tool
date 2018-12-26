package org.lukaswagner.autoannotator;

import com.google.gson.Gson;
import org.apache.pdfbox.pdmodel.PDDocument;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class ByPageNumRequest {
    public String documentID;
    public RegionOfInterest regionOfInterest;
    public String mode;

    public static ByPageNumRequest fromJSON(String json) {
        Gson gson = new Gson();
        return gson.fromJson(json, ByPageNumRequest.class);
    }

    public List<RegionOfInterest> getRegionsOfInterest() throws Exception {
        var file = DocumentManager.getDocumentById(this.documentID);
        var document = PDDocument.load(file);

        var numberOfPages = document.getNumberOfPages();

        var modulo = 0;
        var base = 0;
        switch (mode) {
            case "even":
                modulo = 2;
                base = 0;
                break;
            case "odd":
                modulo = 2;
                base = 1;
                break;
            case "all":
                modulo = 0;
                base = 0;
                break;
            default:
                throw new Exception("Invalid mode");
        }


        var rois = new ArrayList<RegionOfInterest>();

        for (int i = 1; i <= numberOfPages; i++) {
            if ((i + base) % modulo == 0) {
                var newRoi = new RegionOfInterest(this.regionOfInterest);
                newRoi.setPageNumber(i);
                rois.add(newRoi);
            }
        }

        return rois;
    }
}


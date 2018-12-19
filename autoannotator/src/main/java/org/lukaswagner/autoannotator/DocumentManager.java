package org.lukaswagner.autoannotator;

import java.io.File;

public class DocumentManager {
    public static File getDocumentById(String id) {
        return new File("../backend/files/" + id);
    }
}

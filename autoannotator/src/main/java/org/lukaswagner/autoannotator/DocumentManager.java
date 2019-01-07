package org.lukaswagner.autoannotator;

import java.io.File;

public class DocumentManager {
    public static File getDocumentById(String id) {
        var path = System.getenv("FILES_PATH");

        if (path != null) {
            return new File (path + id);
        }

        return new File("../backend/files/" + id);
    }
}

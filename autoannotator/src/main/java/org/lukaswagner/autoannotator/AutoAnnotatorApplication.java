package org.lukaswagner.autoannotator;

import com.google.gson.Gson;

import static spark.Spark.*;

public class AutoAnnotatorApplication {
    public static void main(String[] args) {
        put("/api/byfontstyle", (req, res) -> {
            var gson = new Gson();
            var obj = ByFontStyleRequest.fromJSON(req.body());
            return gson.toJson(obj.getRegionsOfInterest());
        });
    }

}


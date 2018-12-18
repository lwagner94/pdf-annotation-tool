package org.lukaswagner.autoannotator;

import java.util.Objects;

public class FontStyle {
    private String fontName;
    private float fontSize;

    public FontStyle(String fontName, float fontSize) {
        this.fontName = fontName;
        this.fontSize = fontSize;
    }


    public String getFontName() {
        return fontName;
    }

    public float getFontSize() {
        return fontSize;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        FontStyle fontStyle = (FontStyle) o;
        return Float.compare(fontStyle.fontSize, fontSize) == 0 &&
                Objects.equals(fontName, fontStyle.fontName);
    }

    @Override
    public int hashCode() {
        return Objects.hash(fontName, fontSize);
    }

    @Override
    public String toString() {
        return "FontStyle{" +
                "fontName='" + fontName + '\'' +
                ", fontSize=" + fontSize +
                '}';
    }
}

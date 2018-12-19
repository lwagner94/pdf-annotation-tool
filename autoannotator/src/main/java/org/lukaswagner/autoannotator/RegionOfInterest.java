package org.lukaswagner.autoannotator;

import java.util.Objects;

public class RegionOfInterest {
    private double x;
    private double y;

    private double width;
    private double height;

    private int pageNumber;


    public RegionOfInterest(int pageNumber, double x, double y, double width, double height) {
        this.pageNumber = pageNumber;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    public int getPageNumber() {
        return pageNumber;
    }

    public double getX() {
        return x;
    }

    public double getY() {
        return y;
    }

    public double getWidth() {
        return width;
    }

    public double getHeight() {
        return height;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        RegionOfInterest that = (RegionOfInterest) o;
        return Double.compare(that.x, x) == 0 &&
                Double.compare(that.y, y) == 0 &&
                Double.compare(that.width, width) == 0 &&
                Double.compare(that.height, height) == 0 &&
                pageNumber == that.pageNumber;
    }

    @Override
    public int hashCode() {
        return Objects.hash(x, y, width, height, pageNumber);
    }

    @Override
    public String toString() {
        return "RegionOfInterest{" +
                "x=" + x +
                ", y=" + y +
                ", width=" + width +
                ", height=" + height +
                ", pageNumber=" + pageNumber +
                '}';
    }
}

package org.lukaswagner.autoannotator;

import java.util.Objects;

public class Point {
    private double x;
    private double y;
    private int pageNumber;

    public Point(int pageNumber, double x, double y) {
        this.pageNumber = pageNumber;
        this.x = x;
        this.y = y;
    }

    public double getX() {
        return x;
    }

    public double getY() {
        return y;
    }

    public int getPageNumber() {
        return pageNumber;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Point point = (Point) o;
        return Double.compare(point.x, x) == 0 &&
                Double.compare(point.y, y) == 0 &&
                pageNumber == point.pageNumber;
    }

    @Override
    public int hashCode() {
        return Objects.hash(x, y, pageNumber);
    }

    @Override
    public String toString() {
        return "Point{" +
                "x=" + x +
                ", y=" + y +
                ", pageNumber=" + pageNumber +
                '}';
    }
}

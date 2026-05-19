package jPlus.util.collections;

import java.awt.*;

public class PointUtils {
    public static final Point ORIGIN = new Point(0, 0);

    public static Point multiply(Point dim, double multiplicand) {
        return new Point((int) (dim.x * multiplicand), (int) (dim.y * multiplicand));
    }
}

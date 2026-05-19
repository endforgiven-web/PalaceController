package jPlus.util.lang;

import java.math.BigDecimal;
import java.math.MathContext;
import java.text.DecimalFormat;

public final class DoubleUtils {

    public static final DecimalFormat standardFormat = new DecimalFormat("#.##");

    public static double round(Number value) {
        return Double.parseDouble(standardFormat.format(value));
    }

    public static double roundToSignificantDigits(double v, int digitCount) {
        BigDecimal bd = new BigDecimal(v);
        bd = bd.round(new MathContext(digitCount));
        return bd.doubleValue();
    }

    public static double bounds(double v, double min, double max) {
        return Math.min(max, Math.max(v, min));
    }

    public static boolean isInBounds(double min, double max, double... doubles) {
        for (double i : doubles) if (i < min || i > max) return false;
        return true;
    }

    public static double softBounds(double originalV, double finalV, double softBound) {
        final double change = finalV - originalV;
        final double absChange = Math.abs(change) * 0.9999;

        final int q = (int) ((Math.signum(change) == Math.signum(finalV))
                ? (finalV / softBound)
                : Math.round(finalV / softBound));

        final double nearestSoftBound = softBound * q;

        final boolean distanceWithinChange = Math.abs(finalV - nearestSoftBound) < absChange;
        final boolean vPassedSoftBound =
                (originalV < nearestSoftBound && finalV > nearestSoftBound) ||
                        (originalV > nearestSoftBound && finalV < nearestSoftBound);

        return (distanceWithinChange && vPassedSoftBound)
                ? nearestSoftBound
                : finalV;
    }

    public static double[] toDoubleArray(float... floats) {
        if (floats == null) return null;

        double[] output = new double[floats.length];
        for (int i = 0; i < floats.length; i++) output[i] = floats[i];
        return output;
    }

    public static boolean canBeParsedAsDouble(String newV) {
        try {
            Double.parseDouble(newV);
            return true;
        } catch (NumberFormatException ignored) {
            return false;
        }
    }

    public static double lerp(double start, double end, double percent) {
        return start * (1 - percent) + end * percent;
    }
}

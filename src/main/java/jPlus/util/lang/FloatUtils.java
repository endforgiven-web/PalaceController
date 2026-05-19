package jPlus.util.lang;

import java.math.BigDecimal;
import java.math.MathContext;

public final class FloatUtils {
    public static float[] multiply(float multiplicand, float... values) {
        if (values == null) return null;
        for (int i = 0; i < values.length; i++) values[i] *= multiplicand;
        return values;
    }

    public static float round(Number value) {
        return Float.parseFloat(DoubleUtils.standardFormat.format(value));
    }

    public static float roundToSignificantDigits(float v, int digitCount) {
        BigDecimal bd = new BigDecimal(v);
        bd = bd.round(new MathContext(digitCount));
        return bd.floatValue();
    }

    public static float bounds(float v, float min, float max) {
        return Math.min(max, Math.max(v, min));
    }
}

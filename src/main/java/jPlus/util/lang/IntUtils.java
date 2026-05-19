package jPlus.util.lang;

/**
 * @author Marcus
 */
public final class IntUtils {
    public static int overflow(int v, int min, int max) {
        return (v > max) ? min
                : (v < min) ? max
                : v;
    }

    public static int incrementOverflow(int v, int min, int max) {
        return overflow(v + 1, min, max);
    }

    public static int bounds(int v, int min, int max) {
        return Math.min(max, Math.max(v, min));
    }

    public static int boundsMin(int v, int min) {
        return Math.max(v, min);
    }

    public static int boundsMax(int v, int max) {
        return Math.min(v, max);
    }

    public static boolean isOutOfBounds(int v, int min, int max){
        return v < min || v > max;
    }

    public static boolean isOutOfBoundsInclude(int v, int min, int max){
        return v <= min || v >= max;
    }

    public static int greatestOf(int... arr) {
        int ret = (arr.length > 0) ? arr[0] : 0;
        for (int i : arr) ret = Math.max(i, ret);
        return ret;
    }

    public static int leastOf(int... arr) {
        int ret = (arr.length > 0) ? arr[0] : 0;
        for (int i : arr) ret = Math.min(i, ret);
        return ret;
    }

    public static int[] toIntArray(float... floats) {
        if (floats == null) return null;

        int[] ret = new int[floats.length];
        for (int i = 0; i < floats.length; i++) ret[i] = Math.round(floats[i]);
        return ret;
    }

    public static int[] toIntArray(double... doubles) {
        if (doubles == null) return null;

        int[] output = new int[doubles.length];
        for (int i = 0; i < doubles.length; i++) output[i] = (int) Math.round(doubles[i]);
        return output;
    }

    public static boolean canBeParsedAsInt(String currentString) {
        try {
            Integer.parseInt(currentString);
            return true;
        } catch (NumberFormatException ignored) {
            return false;
        }
    }

    public static Integer parseIntBliss(String s) {
        try {
            return Integer.parseInt(s);
        } catch (NumberFormatException ignored) {
        }

        return null;
    }

    public static int countDigits(int v) {
        if (v == 0) return 1;
        return (int) (Math.log10(v) + 1);
    }

    public static Integer[] extractDigitStream(String s) {
        final Integer[] ret = new Integer[s.length()];
        int i = 0;
        for (final char c : s.toCharArray()) ret[i++] = (c - 48);
        return ret;
    }

    public static String storeDigitStream(Integer[] integers) {
        final StringBuilder bld = new StringBuilder();
        for (int i : integers) bld.append(i);
        return bld.toString();
    }

    public static int lerp(int start, int end, double percent) {
        return (int) (start * (1 - percent) + end * percent);
    }

    public static int random(int min, int max) {
        return (int) ((max + 1 - min) * Math.random()) + min;
    }

    public static boolean isEven(int i) {
        return i % 2 == 0;
    }

    public static boolean isOdd(int i) {
        return i % 2 != 0;
    }

    public static boolean isSameParity(int i1, int i2) {
        return i1 % 2 == i2 % 2;
    }
}

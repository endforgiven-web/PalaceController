package jPlus.util.io;

import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;

import static jPlus.JPlus.sendError;

public class TimeUtils {
    public static final String STD_DELIMITER = ":";
    public static final String hms = "%d:%d:%d:%d";

    public static String basicDate() {
        return LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE);
    }

    public static String basicDateTime() {
        return LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME);
    }

    public static String fileDateTime() {
        return new SimpleDateFormat("yyyy-MM-dd HH;mm;ss").format(new Date());
    }

    public static int parseSecondsFrom(String s) {
        final int[] multipliers = new int[]{60, 3600, 86400};
        try {
            final String[] split = s.split(STD_DELIMITER);
            int ret = Integer.parseInt(split[split.length - 1]);
            for (int i = split.length - 2, j = 0; i >= 0 && j <= multipliers.length - 1; i--, j++)
                ret += multipliers[j] * Integer.parseInt(split[i]);
            return ret;
        } catch (Exception ex) {
            sendError("Use time format DD:HH:mm:ss", ex);
        }
        return 0;
    }

    public static String presentSeconds(int s) {
        int d = s / 86400;
        int h = s / 3600;
        s %= 3600;
        int m = s / 60;
        s %= 60;
        return String.format(hms, d, h, m, s);
    }

    public static long SW_CHECKPOINT = 0;

    public static void startSW() {
        SW_CHECKPOINT = System.currentTimeMillis();
    }

    public static long stopSW() {
        return System.currentTimeMillis() - SW_CHECKPOINT;
    }
}

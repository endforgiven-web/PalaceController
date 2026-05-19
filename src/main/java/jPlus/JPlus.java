package jPlus;

import jPlus.lang.callback.Receivable3;

public class JPlus {
    public static Receivable3<String, Throwable, Integer> logger = JPlus::baseLogger;

    private static void baseLogger(String s, Throwable t, Integer integer) {
        System.err.println(s);
    }

    public static void sendError(Throwable t) {
        sendError("", t, 1);
    }

    public static void sendError(String message, Throwable t) {
        sendError(message, t, 1);
    }

    public static void sendError(String message, Throwable t, Integer level) {
        logger.receive(message, t, level);
    }
}

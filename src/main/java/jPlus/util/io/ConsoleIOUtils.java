package jPlus.util.io;

import java.util.Scanner;

public class ConsoleIOUtils {

    public static final String NOT_YET_IMPLEMENTED = "Not yet implemented!";
    public static final char INDICATOR = '>';
    private static final Scanner inScanner = new Scanner(System.in);

    public static boolean validateString(String[] args, int index) {
        return args.length > index && args[index].length() >= 1;
    }

    public static boolean validateChar(String[] args, int index) {
        return args.length > index && args[index].length() == 1;
    }

    public static String request(String s) {
        System.out.println(s);
        return request();
    }

    public static String request() {
        System.out.print(INDICATOR);
        return inScanner.nextLine();
    }

    public static boolean confirm(String s) {
        final String in = request(s + " (y/n)");
        return in.charAt(0) == 'y';
    }

    public static void confirm(String s, Runnable run) {
        if (confirm(s)) run.run();
    }

    public static String breakUp(String string, int charsPerLine) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < string.length(); i++) {
            if (i > 0 && (i % charsPerLine == 0)) {
                sb.append(System.lineSeparator());
            }

            sb.append(string.charAt(i));
        }
        return sb.toString();
    }

    public static String breakUpSmart(String string, int charsPerLine) {

        final char NEWLINE = '\n';
        final String SPACE_SEPARATOR = " ";
        final String SPLIT_REGEXP = "\\s+";

        String[] tokens = string.split(SPLIT_REGEXP);
        StringBuilder output = new StringBuilder(string.length());
        int lineLen = 0;
        for (int i = 0; i < tokens.length; i++) {
            String word = tokens[i];

            if (lineLen + (SPACE_SEPARATOR + word).length() > charsPerLine) {
                if (i > 0) {
                    output.append(NEWLINE);
                }
                lineLen = 0;
            }
            if (i < tokens.length - 1 && (lineLen + (word + SPACE_SEPARATOR).length() + tokens[i + 1].length() <=
                    charsPerLine)) {
                word += SPACE_SEPARATOR;
            }
            output.append(word);
            lineLen += word.length();
        }
        return output.toString();
    }

    //***************************************************************//
}

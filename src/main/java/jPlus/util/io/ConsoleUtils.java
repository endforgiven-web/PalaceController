package jPlus.util.io;

import jPlus.lang.callback.Retrievable2;
import jPlus.util.lang.StringUtils;
import jPlus.util.lang.SystemUtils;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static jPlus.JPlus.sendError;

public class ConsoleUtils {

    public static String sep() {
        return System.lineSeparator();
    }

    public static String sep(int repeat) {
        final String sep = sep();
        final StringBuilder ret = new StringBuilder();
        while (repeat-- > 0) ret.append(sep);
        return ret.toString();
    }

    public static void clsBliss() {
        try {
            cls();
        } catch (IOException | InterruptedException ex) {
            sendError("There was a problem clearing the console", ex);
        }
    }

    public static void cls() throws IOException, InterruptedException {
        final SystemUtils.OS os = SystemUtils.getOS();
        switch (os) {
            case WINDOWS:
                clsWin();
                break;
            default:
            case LINUX:
            case MAC:
            case SOLARIS:
                clsLinux();
                break;
        }
    }

    private static void clsWin() throws IOException, InterruptedException {
        RuntimeUtils.execWait("cmd", "/c", "cls");
    }

    private static void clsLinux() throws IOException, InterruptedException {
        RuntimeUtils.execWait("clear");
    }

    //***************************************************************//

    public static final String STANDARD_BANNER_COMP = "*";
    private static final String BANNER_FORMAT = "%1$s" + sep() + "%2$s" + "%1$s";

    public static String encase(String s, String edge) {
        return edge + s + edge;
    }

    public static String encase(String s, char edge) {
        return edge + s + edge;
    }

    private static String encaseMirror(String s, String edge) {
        return edge + s + StringUtils.reverse(edge);
    }

    public static String encaseInBanner(String s) {
        return encaseInBanner(s, STANDARD_BANNER_COMP);
    }

    public static String encaseInBanner(String str, String bannerComp) {
        return encaseInBanner(str.split(sep()), bannerComp, bannerComp, (s, i) -> s);
    }

    public static String encaseInBanner(String[] arr, String bannerComp) {
        return encaseInBanner(arr, bannerComp, bannerComp, (s, i) -> s);
    }

    public static String encaseInBanner(Collection<String> lines, String bannerComp, Retrievable2<String, String, Integer> itemFormatter) {
        return encaseInBanner(lines, bannerComp, bannerComp, itemFormatter);
    }

    public static String encaseInBanner(Collection<String> lines, String ver, String hor, Retrievable2<String, String, Integer> itemFormatter) {
        return encaseInBanner(lines.toArray(new String[0]), ver, hor, itemFormatter);
    }

    public static String encaseInBanner(String[] lines, String ver, String hor, Retrievable2<String, String, Integer> itemFormatter) {
        final String sep = sep();
        final String lineFormat = encaseMirror("%1$s", ver) + sep;
        final StringBuilder formattedLines = new StringBuilder();

        final int maxLength = StringUtils.maxLength(lines);
        int maxLengthF = maxLength;
        for (int i = 0; i < lines.length; i++) {
            final String line = lines[i];
            final int length = line.length();

            final String formattedLine = String.format(lineFormat,
                    StringUtils.addWhiteSpaceR(itemFormatter.retrieve(line, i),
                            maxLength - length));
            maxLengthF = Math.max(maxLengthF, formattedLine.length());

            formattedLines.append(formattedLine);
        }

        final int hL = hor.length();
        final int maxBorderLength = maxLengthF - sep.length();
        final int borderCount = (maxBorderLength + 1) / hL;
        final String border = StringUtils.repeat(hor, borderCount).substring(0, Math.max(0, maxBorderLength));

        return String.format(BANNER_FORMAT, border, formattedLines.toString());
    }

    public static String breakUp(String s, int maxLineSize) {
        List<String> matchList = new ArrayList();
        Pattern regex = Pattern.compile("(.{1," + maxLineSize + "}(?:\\s|$))|(.{0,10})", Pattern.DOTALL);
        Matcher regexMatcher = regex.matcher(s);
        while (regexMatcher.find())
            matchList.add(regexMatcher.group());

        return String.join(System.lineSeparator(), matchList);
    }
}

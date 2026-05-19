package jPlus.util.awt;

import java.text.ParseException;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

import static jPlus.JPlus.sendError;
import static java.awt.event.KeyEvent.*;

public class KeyEvents {

    public static int[][] parseGroup2DBliss(String s) {
        try {
            return parseGroup2D(s);
        } catch (ParseException ex) {
            sendError("Cannot parse " + s, ex);
        }

        return new int[0][];
    }

    public static int[][] parseGroup2D(String s) throws ParseException {
        final String[] split = splitNext(s);
        final int[][] ret = new int[split.length][];
        for (int i = 0; i < split.length; i++) ret[i] = parseGroup(split[i]);
        return ret;
    }

    public static String[] splitNext(String s) {
        return s.split(NEXT_DEL);
    }

    public static int[] parseGroup(String s) throws ParseException {
        final String[] split = s.split(ADD_DEL);
        final int[] ret = new int[split.length];
        for (int i = 0; i < split.length; i++) ret[i] = parse(split[i]);
        return ret;
    }

    //***************************************************************//

    public static void parseGroup2DCBliss(String[] split, Collection<Collection<Integer>> collection) {
        try {
            parseGroupC2D(split, collection);
        } catch (ParseException ex) {
            sendError("Error parsing " + Arrays.toString(split), ex);
        }
    }

    public static void parseGroupC2D(String[] split, Collection<Collection<Integer>> collection) throws ParseException {
        int index = 0;
        for (Collection<Integer> innerCollection : collection) parseGroupC(split[index++], innerCollection);
    }

    public static void parseGroupC(String s, Collection<Integer> collection) throws ParseException {
        final String[] split = s.split(ADD_DEL);
        for (String value : split) collection.add(parse(value));
    }
    //***************************************************************//

    public static int parseBliss(String s) {
        try {
            return parse(s);
        } catch (ParseException e) {
            throw new RuntimeException(e);
        }
    }

    public static int parse(String s) throws ParseException {
        fillSpecialKeys();
        if (s.length() == 1) return parse(s.charAt(0));

        final Integer ret = specialKeys.get(s.toLowerCase());
        if (ret == null) throw new ParseException("Cannot parse special key " + s, 0);
        return ret;
    }

    public static int parse(char c) throws ParseException {
        switch (c) {
            case 'a':
            case 'A':
                return VK_A;
            case 'b':
            case 'B':
                return VK_B;
            case 'c':
            case 'C':
                return VK_C;
            case 'd':
            case 'D':
                return VK_D;
            case 'e':
            case 'E':
                return VK_E;
            case 'f':
            case 'F':
                return VK_F;
            case 'g':
            case 'G':
                return VK_G;
            case 'h':
            case 'H':
                return VK_H;
            case 'i':
            case 'I':
                return VK_I;
            case 'j':
            case 'J':
                return VK_J;
            case 'k':
            case 'K':
                return VK_K;
            case 'l':
            case 'L':
                return VK_L;
            case 'm':
            case 'M':
                return VK_M;
            case 'n':
            case 'N':
                return VK_N;
            case 'o':
            case 'O':
                return VK_O;
            case 'p':
            case 'P':
                return VK_P;
            case 'q':
            case 'Q':
                return VK_Q;
            case 'r':
            case 'R':
                return VK_R;
            case 's':
            case 'S':
                return VK_S;
            case 't':
            case 'T':
                return VK_T;
            case 'u':
            case 'U':
                return VK_U;
            case 'v':
            case 'V':
                return VK_V;
            case 'w':
            case 'W':
                return VK_W;
            case 'x':
            case 'X':
                return VK_X;
            case 'y':
            case 'Y':
                return VK_Y;
            case 'z':
            case 'Z':
                return VK_Z;
            case '`':
            case '~':
                return VK_BACK_QUOTE;
            case '0':
                return VK_0;
            case '1':
                return VK_1;
            case '2':
                return VK_2;
            case '3':
                return VK_3;
            case '4':
                return VK_4;
            case '5':
            case '%':
                return VK_5;
            case '6':
                return VK_6;
            case '7':
                return VK_7;
            case '8':
                return VK_8;
            case '9':
                return VK_9;
            case '-':
                return VK_MINUS;
            case '=':
                return VK_EQUALS;
            case '!':
                return VK_EXCLAMATION_MARK;
            case '@':
                return VK_AT;
            case '#':
                return VK_NUMBER_SIGN;
            case '$':
                return VK_DOLLAR;
            case '^':
                return VK_CIRCUMFLEX;
            case '&':
                return VK_AMPERSAND;
            case '*':
                return VK_ASTERISK;
            case '(':
                return VK_LEFT_PARENTHESIS;
            case ')':
                return VK_RIGHT_PARENTHESIS;
            case '_':
                return VK_UNDERSCORE;
            case '+':
                return VK_PLUS;
            case '\t':
                return VK_TAB;
            case '\n':
                return VK_ENTER;
            case '[':
            case '{':
                return VK_OPEN_BRACKET;
            case ']':
            case '}':
                return VK_CLOSE_BRACKET;
            case '\\':
            case '|':
                return VK_BACK_SLASH;
            case ';':
                return VK_SEMICOLON;
            case ':':
                return VK_COLON;
            case '\'':
                return VK_QUOTE;
            case '"':
                return VK_QUOTEDBL;
            case ',':
            case '<':
                return VK_COMMA;
            case '.':
            case '>':
                return VK_PERIOD;
            case '/':
            case '?':
                return VK_SLASH;
            case ' ':
                return VK_SPACE;
            case '↓':
                return VK_DOWN;
            case '←':
                return VK_LEFT;
            case '→':
                return VK_RIGHT;
            case '↑':
                return VK_UP;
            default:
                throw new ParseException("Cannot parse character " + c, 0);
        }
    }

    //***************************************************************//

    public static String ADD_DEL = "\\+";
    public static String NEXT_DEL = ">";

    private static final Map<String, Integer> specialKeys = new HashMap<>();

    private static void fillSpecialKeys() {
        if (specialKeys.size() == 0) {
            specialKeys.put("ctrl", VK_CONTROL);
            specialKeys.put("alt", VK_ALT);
            specialKeys.put("shift", VK_SHIFT);
            specialKeys.put("tab", VK_TAB);
            specialKeys.put("capslock", VK_CAPS_LOCK);
            specialKeys.put("enter", VK_ENTER);
            specialKeys.put("f1", VK_F1);
            specialKeys.put("f2", VK_F2);
            specialKeys.put("f3", VK_F3);
            specialKeys.put("f4", VK_F4);
            specialKeys.put("f5", VK_F5);
            specialKeys.put("f6", VK_F6);
            specialKeys.put("f7", VK_F7);
            specialKeys.put("f8", VK_F8);
            specialKeys.put("f9", VK_F9);
            specialKeys.put("f10", VK_F10);
            specialKeys.put("f11", VK_F11);
            specialKeys.put("f12", VK_F12);
            specialKeys.put("f13", VK_F13);
            specialKeys.put("f14", VK_F14);
            specialKeys.put("f15", VK_F15);
            specialKeys.put("f16", VK_F16);
            specialKeys.put("f17", VK_F17);
            specialKeys.put("f18", VK_F18);
            specialKeys.put("f19", VK_F19);
            specialKeys.put("f20", VK_F20);
            specialKeys.put("f21", VK_F21);
            specialKeys.put("f22", VK_F22);
            specialKeys.put("f23", VK_F23);
            specialKeys.put("f24", VK_F24);
            specialKeys.put("esc", VK_ESCAPE);
        }
    }
}

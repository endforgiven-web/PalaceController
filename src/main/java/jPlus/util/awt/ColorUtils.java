package jPlus.util.awt;

import java.awt.*;

import static jPlus.JPlus.sendError;

public class ColorUtils {
    public static Color parseRGBA(String rgba) {
        final String[] rgbaSplit = rgba.split(" ");
        try {
            if (rgbaSplit.length == 4)
                return new Color(Integer.parseInt(rgbaSplit[0]), Integer.parseInt(rgbaSplit[1]), Integer.parseInt(rgbaSplit[2]), Integer.parseInt(rgbaSplit[3]));
            else
                return new Color(Integer.parseInt(rgbaSplit[0]), Integer.parseInt(rgbaSplit[1]), Integer.parseInt(rgbaSplit[2]), 255);
        } catch (Exception ex) {
            final String sep = System.lineSeparator();
            sendError("Bad RGBA format."
                    + sep + "For black Use 0 0 0 255"
                    + sep + "For white use 255 255 255 255", ex);
        }

        return Color.BLACK;
    }
}

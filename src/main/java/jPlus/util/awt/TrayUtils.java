package jPlus.util.awt;

import java.awt.*;

public class TrayUtils {
    public static TrayIcon get(Image image) {
        final TrayIcon ret = new TrayIcon(image);
        try {
            SystemTray.getSystemTray().add(ret);
        } catch (AWTException e) {
            System.out.println(e.getMessage());
        }

        return ret;
    }

    public static PopupMenu getPopup(String... menuNames) {
        final PopupMenu ret = new PopupMenu();
        for (String menuName : menuNames)
            ret.add(new MenuItem(menuName));
        return ret;
    }
}

package jPlus.util.awt;

import java.awt.*;
import java.awt.event.InputEvent;
import java.awt.image.BufferedImage;

import static jPlus.JPlus.sendError;

public class RobotUtils {
    public static Robot robot;

    public static void start() {
        if (robot == null) {
            try {
                robot = new Robot();
            } catch (AWTException ex) {
                sendError("RobotUtils: Error creating Robot.", ex);
            }
        }
    }

    //***************************************************************//

    public static void press(int c) {
        robot.keyPress(c);
        robot.keyRelease(c);
    }

    public static void press(int[] chars) {
        for (int c : chars) press(c);

    }

    //***************************************************************//
    public static void click() {
        robot.mousePress(InputEvent.BUTTON1_DOWN_MASK);
        robot.mouseRelease(InputEvent.BUTTON1_DOWN_MASK);
    }

    public static void mouseMove(int x, int y) {
        robot.mouseMove(x, y);
    }

    //***************************************************************//

    public static BufferedImage screenCap() {
        return screenCap(new Point(0, 0));
    }

    public static BufferedImage screenCap(Point p) {
        return screenCap(p, Toolkit.getDefaultToolkit().getScreenSize());
    }

    public static BufferedImage screenCap(Point p, Dimension dim) {
        return robot.createScreenCapture(new Rectangle(p.x, p.y, dim.width, dim.height));
    }
}

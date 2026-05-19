package jPlus.util.awt.image;

import jPlus.lang.Tuple2;
import jPlus.util.collections.PointUtils;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;

import static jPlus.JPlus.sendError;

public class ImageUtils {

    public static String STD_FORMAT = "png";

    public static byte[] toByteArray(BufferedImage bi, String format)
            throws IOException {
        final ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(bi, format, baos);
        return baos.toByteArray();
    }

    public static byte[] toByteArrayBliss(BufferedImage bi, String format) {
        try {
            return toByteArray(bi, format);
        } catch (IOException ex) {
            sendError("Cannot convert " + bi.toString() + ", format: " + format + " to byte array.", ex);
        }

        return new byte[0];
    }

    //***************************************************************//

    public static BufferedImage read(String path) {
        return read(ImageUtils.class.getResourceAsStream(path));
    }

    public static BufferedImage read(InputStream in) {
        try {
            return ImageIO.read(in);
        } catch (IOException ex) {
            ex.printStackTrace();
        }
        return null;
    }

    public static File write(BufferedImage image, String path, String formatName) throws IOException {
        final File file = new File(path + '.' + formatName);
        ImageIO.write(image, formatName, file);
        return file;
    }

    public static File[] write(BufferedImage[] images, String path, String formatName) throws IOException {
        final File[] ret = new File[images.length];
        for (int i = 0; i < images.length; i++)
            ret[i] = write(images[i], path + File.separator + i, formatName);
        return ret;
    }


    public static File writeBliss(BufferedImage image, String path, String formatName) {
        try {
            return write(image, path, formatName);
        } catch (IOException ex) {
            sendError("Cannot write " + image.toString() + " to path " + path + " with format " + formatName, ex);
        }
        return new File("");
    }

    public static File writeBliss(BufferedImage image, String path) {
        return writeBliss(image, path, STD_FORMAT);
    }

    public static File[] writeBliss(BufferedImage[] images, String path, String formatName) {
        try {
            return write(images, path, formatName);
        } catch (IOException ex) {
            sendError("Cannot write " + Arrays.toString(images) + " to path " + path + " with format " + formatName, ex);
        }
        return new File[0];
    }

    public static File[] writeBliss(BufferedImage[] images, String path) {
        return writeBliss(images, path, STD_FORMAT);
    }

    public static BufferedImage readBliss(File file) {
        if (file.exists()) {
            try {
                return ImageIO.read(file);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        return BLANK;
    }

    //***************************************************************//

    public static Image scale(BufferedImage bi, Point dim) {
        return bi.getScaledInstance(dim.x, dim.y, Image.SCALE_SMOOTH);
    }

    public static BufferedImage scaleToBuffered(BufferedImage bi, Point dim) {
        return buffered((scale(bi, dim)));
    }

    public static BufferedImage buffered(Image image) {

        if (image instanceof BufferedImage) {
            return (BufferedImage) image;
        }

        BufferedImage bi = new BufferedImage(
                image.getWidth(null), image.getHeight(null),
                BufferedImage.TYPE_INT_ARGB);

        Graphics2D graphics2D = bi.createGraphics();
        graphics2D.drawImage(image, 0, 0, null);
        graphics2D.dispose();

        return bi;
    }
    //***************************************************************//

    public static final BufferedImage BLANK = new BufferedImage(1, 1, BufferedImage.TYPE_INT_ARGB);

    public static Font monospacedPlain(int fontSize) {
        return new Font(Font.MONOSPACED, Font.PLAIN, fontSize);
    }

    private static void draw(Graphics gfx, Image image, Point loc) {
        gfx.drawImage(image, loc.x, loc.y, null);
    }

    private static void setBackground(BufferedImage image, Color color) {
        final Graphics gfx = image.getGraphics();
        gfx.setColor(color);
        gfx.fillRect(0, 0, image.getWidth(), image.getHeight());
    }

    public static Image thumbnail(File imageFile, Point scaleDim) {
        return scale(readBliss(imageFile), scaleDim);
    }

    public static Tuple2<Image, Point> blankAtOrigin() {
        return new Tuple2<>(BLANK, PointUtils.ORIGIN);
    }

    //***************************************************************//

    public static void caption(BufferedImage image, String caption) {
        final Graphics gfx = image.getGraphics();
        gfx.drawString(caption, image.getWidth() / 2, image.getHeight() / 2);
    }

    public static void caption(BufferedImage image, BufferedImage caption) {
        final Graphics2D gfx = image.createGraphics();
        gfx.drawImage(caption, 0, image.getHeight() - caption.getHeight(), null);
    }

    public static Image fromStream(InputStream stream) {
        try {
            return ImageIO.read(stream);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}


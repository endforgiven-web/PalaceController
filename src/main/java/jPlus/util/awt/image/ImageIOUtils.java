package jPlus.util.awt.image;

import jPlus.lang.Tuple2;

import javax.imageio.IIOException;
import javax.imageio.ImageIO;
import javax.imageio.ImageTypeSpecifier;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;
import java.awt.image.RenderedImage;
import java.io.File;
import java.io.IOException;
import java.util.Iterator;

import static jPlus.JPlus.sendError;

public class ImageIOUtils {
    public static boolean write(Iterator<Tuple2<RenderedImage, File>> iter,
                                String formatName) throws IOException {
        ImageWriter writer = doWriteFirst(iter, formatName);
        if (writer == null) return false;

        boolean success = true;
        try {
            while (iter.hasNext()) {
                final Tuple2<RenderedImage, File> item = iter.next();
                final RenderedImage im = item.a;

                final File output = item.b;
                doWriteOpen(im, output, writer);
            }
        } catch (Exception ex) {
            success = false;
            sendError("Cannot write image.", ex);
        } finally {
            writer.dispose();
        }

        return success;
    }

    private static ImageWriter doWriteFirst(Iterator<Tuple2<RenderedImage, File>> iter, String formatName) throws IOException {
        if (iter.hasNext()) {
            final Tuple2<RenderedImage, File> first = iter.next();
            final ImageWriter ret = getWriter(first.a, formatName);
            doWriteOpen(first.a, first.b, ret);
            return ret;
        }
        return null;
    }

    public static void doWriteOpen(RenderedImage im, File output, ImageWriter writer) throws IOException {
        if (output == null) throw new IllegalArgumentException("output == null!");

        ImageOutputStream stream = ImageIO.createImageOutputStream(output);
        if (stream == null) throw new IIOException("Can't create an ImageOutputStream!");
        try {
            output.delete();
            writer.setOutput(stream);
            writer.write(im);
        } finally {
            stream.flush();
            stream.close();
        }
    }

    private static ImageWriter getWriter(RenderedImage im,
                                         String formatName) {
        ImageTypeSpecifier type =
                ImageTypeSpecifier.createFromRenderedImage(im);
        Iterator<ImageWriter> iter = ImageIO.getImageWriters(type, formatName);

        if (iter.hasNext()) {
            return iter.next();
        } else {
            return null;
        }
    }
}

package jfxPlus.scene.image;

import javafx.scene.image.Image;
import javafx.scene.layout.Pane;
import jfxPlus.event.DragUtils;

public class JFXImageUtils {
    public static final Image BLANK = new Pane().snapshot(DragUtils.ALPHA_PARAMS, null);
}

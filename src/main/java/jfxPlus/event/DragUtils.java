package jfxPlus.event;

import javafx.scene.Node;
import javafx.scene.SnapshotParameters;
import javafx.scene.image.Image;
import javafx.scene.input.DragEvent;
import javafx.scene.input.Dragboard;
import javafx.scene.input.TransferMode;
import javafx.scene.paint.Color;

public class DragUtils {
    public static final SnapshotParameters ALPHA_PARAMS = new SnapshotParameters();

    public static void initialize(){
        DragUtils.ALPHA_PARAMS.setFill(Color.TRANSPARENT);
    }

    public static Image centerDragViewImage(Dragboard db, Node source) {
        final Image image = source.snapshot(ALPHA_PARAMS, null);
        db.setDragViewOffsetX(image.getWidth() / 2);
        db.setDragViewOffsetY(image.getHeight() / 2);
        db.setDragView(image);

        return image;
    }

    public static void over(DragEvent ev) {
        final Node target = (Node) ev.getSource();
        if (ev.getGestureSource() != target &&
                ev.getDragboard().hasString()) {
            ev.acceptTransferModes(TransferMode.COPY_OR_MOVE);
        }
        ev.consume();
    }
}

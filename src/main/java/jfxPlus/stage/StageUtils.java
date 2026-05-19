package jfxPlus.stage;

import javafx.stage.Stage;

public class StageUtils {
    public static void sizeToSceneCentered(Stage stage) {
        final double prevWidth = stage.getWidth();
        final double prevHeight = stage.getHeight();
        stage.sizeToScene();

        if (!Double.isNaN(prevHeight)) {
            stage.setX(stage.getX() + ((prevWidth - stage.getWidth()) / 2));
            stage.setY(stage.getY() + ((prevHeight - stage.getHeight()) / 2));
        }
    }
}

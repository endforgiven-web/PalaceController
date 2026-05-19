package jfxPlus.core;

import javafx.fxml.FXMLLoader;
import javafx.scene.control.ScrollPane;
import javafx.scene.control.TitledPane;
import javafx.scene.layout.Pane;

import java.io.IOException;

public class JFXLoadUtils {
    public static void loadRootController(Object rootController, String fxmlPath) {
        FXMLLoader loader = new FXMLLoader(JFXLoadUtils.class.getResource(fxmlPath));

        loader.setRoot(rootController);
        loader.setController(rootController);

        try {
            loader.load();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static <T> T loadRoot(Object root, String fxmlPath) {
        FXMLLoader loader = new FXMLLoader(JFXLoadUtils.class.getResource(fxmlPath));
        loader.setRoot(root);

        try {
            loader.load();
        } catch (IOException e) {
            e.printStackTrace();
        }

        return loader.getController();
    }

    public static <T> T loadPane(ScrollPane root, String fxmlPath) {
        FXMLLoader loader = new FXMLLoader(JFXLoadUtils.class.getResource(fxmlPath));

        try {
            root.setContent(loader.load());
        } catch (IOException e) {
            e.printStackTrace();
        }

        return loader.getController();
    }

    public static <T> T loadPane(TitledPane root, String fxmlPath) {
        FXMLLoader loader = new FXMLLoader(JFXLoadUtils.class.getResource(fxmlPath));

        try {
            root.setContent(loader.load());
        } catch (IOException e) {
            e.printStackTrace();
        }

        return loader.getController();
    }

    public static <T> T loadPane(Pane root, String fxmlPath) {
        FXMLLoader loader = new FXMLLoader(JFXLoadUtils.class.getResource(fxmlPath));

        try {
            root.getChildren().add(loader.load());
        } catch (IOException e) {
            e.printStackTrace();
        }

        return loader.getController();
    }

    public static <T> T loadController(String fxmlPath) {
        FXMLLoader loader = new FXMLLoader(JFXLoadUtils.class.getResource(fxmlPath));
        try {
            loader.load();
        } catch (IOException e) {
            e.printStackTrace();
        }

        return loader.getController();
    }
}

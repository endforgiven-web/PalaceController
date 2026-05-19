package com.Bar.Mar.GUI;

import com.Bar.Mar.Main;
import jPlusLibs.Maven.MavenUtils;
import javafx.application.Application;
import javafx.event.Event;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.image.Image;
import javafx.stage.Stage;
import javafx.stage.StageStyle;
import jfxPlus.core.JFXLoadUtils;

import java.io.IOException;
import java.util.Objects;

public class JFXEP extends Application {

    public static Stage stage;
    public static Scene scene;

    public AppController controller;

    @Override
    public void start(Stage stage) throws IOException {

        this.controller = JFXLoadUtils.loadController("/app.fxml");

        stage.getIcons().add(new Image(Objects.requireNonNull(getClass().getClassLoader().getResourceAsStream("icon.jfif"))));
        stage.setTitle("Palace Controller");
        stage.setScene(scene);

        JFXEP.stage = stage;
        initStage(this.controller.root);
        stage.show();


        setOnClose(stage);
    }

    protected void setOnClose(Stage stage) {
        stage.setOnCloseRequest(this::close);
    }

    private void initStage(Parent root) {
        scene = new Scene(root);
        stage.setScene(scene);
        stage.setResizable(false);
        stage.setMinWidth(480);
        stage.setMinHeight(280);

        stage.initStyle(StageStyle.UNDECORATED);

        TitleBarController.INST.versionLabel.setText("v" + MavenUtils.getPomVersion());
        final String pomName = MavenUtils.getPomName();
        TitleBarController.INST.nameLabel.setText(pomName.equals(MavenUtils.NEUTRAL_V) ? "Palace Controller" : pomName);

        this.controller.titleBarController.xButton.setOnAction(this::close);
        this.controller.titleBarController.minButton.setOnAction(this::minimize);
        this.controller.titleBarController.setIcon(new Image(Main.getIconPath()));
    }

    protected void close(Event actionEvent) {
        System.out.println("Closing JFX.");
        System.exit(0);
    }

    protected void minimize(Event actionEvent) {
        stage.setIconified(true);
    }

    public static void main(String[] args) {
        launch();
    }
}
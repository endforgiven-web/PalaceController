package com.Bar.Mar.GUI;

import javafx.scene.Node;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.Tooltip;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.input.MouseEvent;
import javafx.scene.layout.HBox;
import javafx.stage.Stage;

public class TitleBarController {
    public static TitleBarController INST;
    public Button minButton;
    public Button xButton;
    public Tooltip versionLabel;
    public HBox root;
    public ImageView icon;
    public Label nameLabel;

    private double dragOffsetX = 0;
    private double dragOffsetY = 0;

    public void initialize() {

        this.root.setOnMousePressed(this::handleMousePressed);
        this.root.setOnMouseDragged(this::handleMouseDragged);

        INST=this;
    }

    protected void handleMousePressed(MouseEvent e) {

        final Stage pStage = getPrimaryStage(this.root);

        this.dragOffsetX = e.getScreenX() - pStage.getX();
        this.dragOffsetY = e.getScreenY() - pStage.getY();
    }

    protected void handleMouseDragged(MouseEvent e) {

        final Stage pStage = getPrimaryStage(this.root);

        pStage.setX(e.getScreenX() - this.dragOffsetX);
        pStage.setY(e.getScreenY() - this.dragOffsetY);
    }

    //***************************************************************//
    public static Stage getPrimaryStage(Node node) {
        return (Stage) node.getScene().getWindow();
    }

    public String getName() {
        return nameLabel.getText();
    }

    public void setName(String name) {
        this.nameLabel.setText(name);
    }

    public void setIcon(Image image) {
        this.icon.setImage(image);
    }
}

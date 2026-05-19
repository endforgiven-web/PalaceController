package jfxPlus.scene.control.textFields;

import javafx.event.Event;
import javafx.geometry.Pos;
import javafx.scene.control.ContentDisplay;
import javafx.scene.control.Label;
import javafx.scene.control.TextField;
import javafx.scene.input.ContextMenuEvent;
import jfxPlus.core.JFXNodeUtils;

public class EditableLabel extends Label {

    protected final TextField textField = new TextField();

    public EditableLabel() {
        super();

        JFXNodeUtils.safeAddClass("pastel-green", this.textField);

        setGraphic(textField);
        setContentDisplay(ContentDisplay.TEXT_ONLY);

        setMinWidth(70);
        setMaxWidth(Double.MAX_VALUE);
        setPrefHeight(30);

        setAlignment(Pos.CENTER);
        textField.setAlignment(Pos.CENTER);

        textProperty().bindBidirectional(textField.textProperty());

        setOnMouseClicked(mouseEvent -> {
            if (mouseEvent.getClickCount() == 2) {
                setContentDisplay(ContentDisplay.GRAPHIC_ONLY);
                textField.requestFocus();
            }
        });

        textField.addEventFilter(ContextMenuEvent.ANY, Event::consume);

        textField.prefWidthProperty().bind(this.widthProperty());
    }

    public TextField getTextField() {
        return this.textField;
    }
}
package jfxPlus.scene.layout.panes;

import javafx.collections.ObservableList;
import javafx.geometry.Pos;
import javafx.scene.Node;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;

public class SplitHBox extends HBox {
    private final HBox left = new HBox();

    public SplitHBox() {
        super();
        this.getChildren().add(this.left);
        HBox.setHgrow(this.left, Priority.ALWAYS);
        this.setLeftAlignment(Pos.CENTER_LEFT);
        this.setAlignment(Pos.CENTER_RIGHT);
    }

    public ObservableList<Node> getLeftChildren() {
        return this.left.getChildren();
    }

    public ObservableList<Node> getRightChildren() {
        return this.getChildren();
    }

    public void setLeftSpacing(double v) {
        this.left.setSpacing(v);
    }

    public double getLeftSpacing() {
        return this.left.getSpacing();
    }

    public void setLeftAlignment(Pos pos) {
        this.left.setAlignment(pos);
    }

    public Pos getLeftAlignment() {
        return this.left.getAlignment();
    }
}
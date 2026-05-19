package jfxPlus.scene.layout.gridPanes;

import jPlus.lang.callback.Retrievable;
import javafx.collections.ObservableList;
import javafx.scene.Node;
import javafx.scene.layout.GridPane;

public class GridItems extends GridPane {

    protected int rows;
    protected int cols;

    public GridItems() {
        super();
        this.getStyleClass().add("grid-items");
    }

    public ObservableList<Node> fill(Retrievable<Node> createNodes) {
        final ObservableList<Node> children = this.getChildren();

        children.clear();

        for (int rI = 0; rI < rows; rI++) {
            for (int cI = 0; cI < cols; cI++) {
                final Node newNode = createNodes.retrieve();
                GridPaneUtils.setGridPos(rI, cI, newNode);
                children.add(newNode);
            }
        }

        return children;
    }

    public int getRows() {
        return rows;
    }

    public void setRows(int rows) {
        this.rows = rows;
    }

    public int getCols() {
        return cols;
    }

    public void setCols(int cols) {
        this.cols = cols;
    }
}

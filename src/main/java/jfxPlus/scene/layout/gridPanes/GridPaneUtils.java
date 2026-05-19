package jfxPlus.scene.layout.gridPanes;

import javafx.scene.Node;
import javafx.scene.layout.GridPane;

public class GridPaneUtils {

    public static void setGridPos(int rowIndex, int columnIndex, Node node) {
        GridPane.setRowIndex(node, rowIndex);
        GridPane.setColumnIndex(node, columnIndex);
    }

    public static void setGridPos(int rowIndex, int columnIndex, int rowSpan, int columnSpan, Node node) {
        setRow(rowIndex, rowSpan, node);
        setCol(columnIndex, columnSpan, node);
    }

    private static void setCol(int columnIndex, int columnSpan, Node node) {
        GridPane.setColumnIndex(node, columnIndex);
        GridPane.setColumnSpan(node, columnSpan);
    }

    private static void setRow(int rowIndex, int rowSpan, Node node) {
        GridPane.setRowIndex(node, rowIndex);
        GridPane.setRowSpan(node, rowSpan);
    }
}

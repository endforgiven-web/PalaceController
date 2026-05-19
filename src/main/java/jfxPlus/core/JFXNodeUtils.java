package jfxPlus.core;

import javafx.beans.property.BooleanProperty;
import javafx.beans.value.ObservableBooleanValue;
import javafx.event.ActionEvent;
import javafx.event.Event;
import javafx.event.EventHandler;
import javafx.event.EventType;
import javafx.scene.Node;
import javafx.scene.Parent;
import javafx.scene.control.MenuItem;
import javafx.scene.control.ScrollPane;

import java.util.Iterator;

public class JFXNodeUtils {

    public static boolean addClass(String cssClass, Node... nodes) {
        boolean wasAdded = false;
        for (Node n : nodes) wasAdded = n.getStyleClass().add(cssClass);
        return wasAdded;
    }

    public static boolean removeClass(String cssClass, Node... nodes) {
        boolean wasAdded = false;
        for (Node n : nodes) wasAdded = n.getStyleClass().removeIf(style -> style.equals(cssClass));
        return wasAdded;
    }

    public static boolean addOrRemoveClass(String cssClass, boolean willAdd, Node... nodes) {
        return willAdd ? safeAddClass(cssClass, nodes) : removeClass(cssClass, nodes);
    }


    public static boolean safeAddClass(String cssClass, Node... nodes) {
        removeClass(cssClass, nodes);
        return addClass(cssClass, nodes);
    }

    public static boolean addClass(String cssClass, MenuItem... items) {
        boolean wasAdded = false;
        for (MenuItem item : items) wasAdded = item.getStyleClass().add(cssClass);
        return wasAdded;
    }

    public static boolean removeClass(String cssClass, MenuItem... items) {
        boolean wasAdded = false;
        for (MenuItem item : items) wasAdded = item.getStyleClass().removeIf(style -> style.equals(cssClass));
        return wasAdded;
    }

    public static boolean safeAddClass(String cssClass, MenuItem... items) {
        removeClass(cssClass, items);
        return addClass(cssClass, items);
    }

    public static boolean hasClass(String cssClass, Node node) {
        return node.getStyleClass().contains(cssClass);
    }

    public static boolean isAncestor(Parent parent, Node child) {
        if (child == null) {
            return false;
        }
        Parent curr = child.getParent();
        while (curr != null) {
            if (curr == parent) {
                return true;
            }
            curr = curr.getParent();
        }
        return false;
    }

    public static EventHandler<ActionEvent> addEventFilter(Node node) {
        return addEventFilter(node, ActionEvent.ANY);
    }

    public static EventHandler<ActionEvent> addEventFilter(Node node, EventType<ActionEvent> eventType) {
        EventHandler<ActionEvent> filter = Event::consume;
        node.addEventFilter(eventType, filter);
        return filter;
    }

    public static void removeEventFilter(Node node, EventHandler<ActionEvent> filter) {
        node.removeEventFilter(ActionEvent.ANY, filter);
    }

    public static void setVisibleAndManaged(Node node, boolean b) {
        node.setVisible(b);
        node.setManaged(b);
    }

    public static boolean isVisibleAndManaged(Node node) {
        return node.isVisible() && node.isManaged();
    }

    public static void bindVisibleAndManaged(Node node, BooleanProperty b) {
        node.managedProperty().bind(b);
        node.visibleProperty().bind(b);
    }

    public static ObservableBooleanValue getRecursiveOrBinding(Iterator<BooleanProperty> iter) {
        final BooleanProperty item = iter.next();
        if (iter.hasNext()) return item.or(getRecursiveOrBinding(iter));
        else return item;
    }

    public static ScrollPane createPrettyScrollPane() {
        final ScrollPane scrollPane = new ScrollPane();

        scrollPane.setFitToWidth(true);
        scrollPane.setHbarPolicy(ScrollPane.ScrollBarPolicy.NEVER);
        scrollPane.setMinHeight(0);
        scrollPane.setMinWidth(0);

        return scrollPane;
    }
}

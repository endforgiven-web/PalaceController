package jfxPlus.scene.control;

import javafx.beans.property.IntegerProperty;
import javafx.beans.property.SimpleIntegerProperty;
import javafx.beans.value.ObservableValue;
import javafx.collections.ListChangeListener;
import javafx.collections.ObservableList;
import javafx.event.Event;
import javafx.geometry.Orientation;
import javafx.scene.control.Accordion;
import javafx.scene.control.TitledPane;
import javafx.scene.layout.VBox;

public class AccordionPlus extends VBox {

    protected final Accordion accordion;

    protected final IntegerProperty expandedIndex = new SimpleIntegerProperty(-1);

    public AccordionPlus() {
        super();
        accordion = new Accordion();
        getChildren().add(accordion);
        init();
    }

    public AccordionPlus(TitledPane... titledPanes) {
        super();
        accordion = new Accordion(titledPanes);
        getChildren().add(accordion);
        init();
    }

    public final IntegerProperty expandedIndexProperty() {
        return expandedIndex;
    }

    public final int getExpandedIndex(){
        return expandedIndex.getValue();
    }

    public final void setExpandedIndex(int i){
//        accordion.setExpandedPane(getPanes().get(i));
        expandedIndex.setValue(i);
    }

    //***************************************************************//

    public final ObservableList<TitledPane> getPanes() {
        return accordion.getPanes();
    }

    public TitledPane getExpandedPane(){
        return accordion.getExpandedPane();
    }
    public void requestLayout() {
        accordion.requestLayout();
    }

    public Orientation getContentBias() {
        return accordion.getContentBias();
    }

    //***************************************************************//

    private void init() {
//        accordion.expandedPaneProperty().addListener(this::listenForExpandedPaneSwitch);
        accordion.getPanes().addListener(this::listenForPanesChanged);
        expandedIndex.addListener(this::listenForExpandedIndexChange);
    }

    private void listenForPanesChanged(ListChangeListener.Change<? extends TitledPane> change) {
        if(change.next()){
            for(var tP : change.getAddedSubList()) tP.setOnMousePressed(this::handlePaneExpanded);
            for(var tP : change.getRemoved()) tP.setOnMouseClicked(null);
        }
    }

    private void handlePaneExpanded(Event e) {
        e.consume();
        final TitledPane tP = (TitledPane) e.getSource();
        if(tP.isExpanded()) expandedIndex.setValue(accordion.getPanes().indexOf(tP));
        else expandedIndex.setValue(-1);
    }

    private void listenForExpandedIndexChange(ObservableValue<? extends Number> obs, Number oldV, Number newV){
        accordion.setExpandedPane(getPanes().get(newV.intValue()));
    }

//    private void listenForExpandedPaneSwitch(ObservableValue<? extends TitledPane> obs, TitledPane oldTP, TitledPane newTP) {
//        if (newTP != null) {
//            expandedIndex.setValue(accordion.getPanes().indexOf(newTP));
//        } else {
//            expandedIndex.setValue(-1);
//        }
//    }
}

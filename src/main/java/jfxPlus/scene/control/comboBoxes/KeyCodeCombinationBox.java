package jfxPlus.scene.control.comboBoxes;

import javafx.beans.property.ObjectProperty;
import javafx.beans.property.SimpleObjectProperty;
import javafx.collections.FXCollections;
import javafx.event.Event;
import javafx.scene.control.ComboBox;
import javafx.scene.control.Label;
import javafx.scene.input.KeyCode;
import javafx.scene.input.KeyCodeCombination;
import javafx.scene.layout.HBox;

import static javafx.scene.input.KeyCombination.*;

public class KeyCodeCombinationBox extends HBox {

    protected ObjectProperty<KeyCodeCombination> valueProperty = new SimpleObjectProperty<>();

    public ComboBox<KeyCode> keyCodeCombo = new ComboBox<>();
    public ComboBox<Modifier> modifierCombo = new ComboBox<>();

    protected Label label = new Label();

    public KeyCodeCombinationBox() {
        super();
        buildStructure();
        setListeners();
    }

    private void buildStructure() {
        getChildren().addAll(label, modifierCombo, keyCodeCombo);
        setSpacing(6);
        keyCodeCombo.setItems(FXCollections.observableArrayList(KeyCode.values()));
        keyCodeCombo.setValue(keyCodeCombo.getItems().get(0));
        modifierCombo.getItems().addAll(POSSIBLE_MODIFIERS);
        modifierCombo.setValue(modifierCombo.getItems().get(0));
    }

    private void setListeners() {
        keyCodeCombo.setOnAction(this::handleKeyCodeAction);
        modifierCombo.setOnAction(this::handleModifierAction);
    }

    //***************************************************************//

    private void handleModifierAction(Event e) {
        e.consume();
        refresh();
    }


    private void handleKeyCodeAction(Event e) {
        e.consume();
        refresh();
    }

    protected void refresh() {
        if (keyCodeCombo.getValue().equals(modifierCombo.getValue().getKey())) return;

        final var newV = new KeyCodeCombination(keyCodeCombo.getValue(), modifierCombo.getValue());
        valueProperty.set(newV);
    }

    //***************************************************************//

    public ObjectProperty<KeyCodeCombination> valueProperty() {
        return valueProperty;
    }

    public void setKeyCode(KeyCode code) {
        if (code != null) {
            keyCodeCombo.setValue(code);
            refresh();
        }
    }

    public void setModifier(Modifier modifier) {
        if (modifier != null) {
            modifierCombo.setValue(modifier);
            refresh();
        }
    }

    //***************************************************************//

    public static final Modifier[] POSSIBLE_MODIFIERS = new Modifier[]{
            SHIFT_DOWN, SHIFT_ANY,
            CONTROL_DOWN, CONTROL_ANY,
            ALT_DOWN, ALT_ANY, META_DOWN,
            META_ANY,
            SHORTCUT_DOWN, SHORTCUT_ANY
    };

    public static Modifier modifierValueOf(String s) {
        for (final Modifier mod : POSSIBLE_MODIFIERS) if (mod.toString().equals(s)) return mod;
        return null;
    }

    public String getLabel() {
        return label.getText();
    }

    public void setLabel(String s) {
        label.setText(s);
    }
}

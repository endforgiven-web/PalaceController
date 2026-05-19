package jfxPlus.scene.control.textFields;

import javafx.beans.property.DoubleProperty;
import javafx.beans.property.SimpleDoubleProperty;
import javafx.event.ActionEvent;
import javafx.event.Event;
import javafx.scene.control.TextField;
import javafx.scene.control.TextFormatter;
import javafx.util.StringConverter;

import java.text.DecimalFormat;
import java.util.function.UnaryOperator;
import java.util.regex.Pattern;

public class DoubleField extends TextField {

    protected double defaultValue = 0;
    protected final DoubleProperty valueProperty = new SimpleDoubleProperty();

    protected final DoubleStringConverter converter = new DoubleStringConverter();
    protected int decimalCount = 2;

    public DoubleField() {
        super();

        UnaryOperator<TextFormatter.Change> filter = createFilter();
        TextFormatter<Number> textFormatter = new TextFormatter<>(converter, 0.0, filter);
        setTextFormatter(textFormatter);

        textProperty().bindBidirectional(valueProperty, converter);

        setDecimalCount(decimalCount);

        this.getStyleClass().add("double-field");
    }

    public DoubleField(double value) {
        this();
        valueProperty.setValue(value);
    }

    public DoubleField(double value, Double min, Double max, int decimalCount) {
        this(value);
        converter.min = min;
        converter.max = max;
        setDecimalCount(decimalCount);
        valueProperty.setValue(value);
    }

    private UnaryOperator<TextFormatter.Change> createFilter() {
        final Pattern validEditingState = Pattern.compile("-?(([1-9][0-9]*)|0)?(\\.[0-9]*)?");

        return c -> {
            String text = c.getControlNewText();
            if (validEditingState.matcher(text).matches()) {
                return c;
            } else {
                return null;
            }
        };
    }

    public DoubleProperty valueProperty() {
        return valueProperty;
    }

    public double getValue() {
        return valueProperty.getValue();
    }

    public int intValue() {
        return (int)getValue();
    }

    public float floatValue() {
        return (float)getValue();
    }

    public void setValue(double d) {
        valueProperty.setValue(d);
    }

    public void handleToDefault(Event e) {
        e.consume();
        valueProperty.setValue(defaultValue);
    }

    public double getDefaultValue() {
        return defaultValue;
    }

    public void setDefaultValue(double defaultValue) {
        this.defaultValue = defaultValue;
        handleToDefault(new ActionEvent());
    }

    public int getDecimalCount() {
        return decimalCount;
    }

    public void setDecimalCount(int count) {
        this.decimalCount = count;
        converter.df = new DecimalFormat("#" + (count > 0 ? "." : "") + "#".repeat(count));
    }

    public DecimalFormat getDf() {
        return converter.df;
    }

    public Double getMin() {
        return converter.min;
    }

    public void setMin(Double min) {
        converter.min = min;
    }

    public Double getMax() {
        return converter.max;
    }

    public void setMax(Double max) {
        converter.max = max;
    }

    public static class DoubleStringConverter extends StringConverter<Number> {

        protected DecimalFormat df;

        protected Double max = null;
        protected Double min = null;

        public DoubleStringConverter() {
            df = new DecimalFormat("#.##");
        }

        public DoubleStringConverter(final DecimalFormat df) {
            this.df = df;
        }

        @Override
        public Double fromString(String s) {
            if (s.isEmpty() || "-".equals(s) || ".".equals(s) || "-.".equals(s)) {
                return 0.0;
            } else {
                double newV = Double.parseDouble(s);

                newV = max == null ? newV : Math.min(max, newV);
                newV = min == null ? newV : Math.max(min, newV);

                return newV;
            }
        }

        @Override
        public String toString(Number d) {
            return df.format(d);
        }
    }
}

package jfxPlus.core;

import javafx.beans.property.Property;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

public class JFXPropertyUtils {
    public static <T, F extends Property<T>> Map<String, T> propertyToValueMap(Map<String, F> map) {
        return map.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey, e -> e.getValue().getValue(),
                        (a, b) -> a, HashMap::new));
    }
}

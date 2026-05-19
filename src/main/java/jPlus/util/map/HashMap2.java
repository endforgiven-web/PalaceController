package jPlus.util.map;

import java.util.HashMap;
import java.util.Map;

public class HashMap2<KEY, T1, T2> {
    public final Map<KEY, T1> t1 = HashMap2.mapImpl();
    public final Map<KEY, T2> t2 = HashMap2.mapImpl();

    protected static <K, V> Map<K, V> mapImpl() {
        return new HashMap<>();
    }

    protected void clear() {
        t1.clear();
        t2.clear();
    }
}

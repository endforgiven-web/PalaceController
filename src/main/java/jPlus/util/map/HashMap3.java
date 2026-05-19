package jPlus.util.map;

import java.util.Map;

public class HashMap3<KEY, T1, T2, T3> extends HashMap2<KEY, T1, T2> {
    public final Map<KEY, T3> t3 = HashMap2.mapImpl();

    @Override
    public void clear() {
        super.clear();
        t3.clear();
    }
}

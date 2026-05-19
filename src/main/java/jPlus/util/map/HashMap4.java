package jPlus.util.map;

import java.util.Map;

public class HashMap4<KEY, T1, T2, T3, T4> extends HashMap3<KEY, T1, T2, T3> {
    public final Map<KEY, T4> t4 = HashMap2.mapImpl();

    @Override
    public void clear() {
        super.clear();
        t4.clear();
    }
}

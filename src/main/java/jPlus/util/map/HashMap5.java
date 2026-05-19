package jPlus.util.map;

import java.util.Map;

public class HashMap5<KEY, T1, T2, T3, T4, T5> extends HashMap4<KEY, T1, T2, T3, T4> {
    public final Map<KEY, T5> t5 = HashMap2.mapImpl();

    @Override
    public void clear(){
        super.clear();
        t5.clear();
    }
}

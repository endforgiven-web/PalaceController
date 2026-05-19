package jPlus.lang;

public class Tuple1<A> {
    public final A a;

    public Tuple1(A a) {
        this.a = a;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Tuple1<?> tuple = (Tuple1<?>) o;
        return a.equals(tuple.a);
    }

    @Override
    public int hashCode() {
        return 31 *  a.hashCode();
    }

    public A getA() {
        return a;
    }
}

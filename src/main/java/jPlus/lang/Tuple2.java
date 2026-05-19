package jPlus.lang;

/**
 * @see "http://www.javatuples.org/ for a more thorough approach"
 * Hey! It's Marcus. So basically, a Tuple is a lot like a hashmap
 * entry, but on it's own. Or think of it as a single enum entry, non-static
 * of course. Do HashMap<String, Tuple<MyObject, MySecondObject>>.
 * Make more tuples! This is tuple2, but A, B, C would be tuple3.
 */
public class Tuple2<A, B> extends Tuple1<A> {

    public final B b;

    public Tuple2(A a, B b) {
        super(a);
        this.b = b;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Tuple2<?, ?> tuple = (Tuple2<?, ?>) o;
        if (!a.equals(tuple.a)) return false;
        return b.equals(tuple.b);
    }

    @Override
    public int hashCode() {
        return super.hashCode() + b.hashCode();
    }

    public B getB() {
        return b;
    }
}

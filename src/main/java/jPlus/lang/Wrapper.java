package jPlus.lang;

public class Wrapper<A> {
    private A a;

    public Wrapper() {
    }

    public Wrapper(A a) {
        this.a = a;
    }

    public A getA() {
        return a;
    }

    public void setA(A a) {
        this.a = a;
    }
}

package jPlus.io;

public enum Access {
    PUBLIC(1),
    PROTECTED(2),
    PRIVATE(3);

    Access(int value) {
        this.value = value;
    }

    private final int value;

    public int value() {
        return value;
    }
}

package jPlus.io;

public enum Priority {
    LOW(1),
    MEDIUM(2),
    HIGH(3);

    Priority(int value) {
        this.value = value;
    }

    private final int value;

    public int value() {
        return value;
    }
}

package jPlus.lang;

public interface Deserializable<T> {
    T fromString(String s);
}

package jPlus.lang.callback;

public interface Retrievable3<RET, REC1, REC2, REC3>  {
    RET retrieve(REC1 rec1, REC2 rec2, REC3 rec3);
}

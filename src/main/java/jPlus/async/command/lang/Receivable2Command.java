package jPlus.async.command.lang;

import jPlus.async.command.ThreadCommand;
import jPlus.lang.callback.Receivable2;
import jPlus.lang.callback.Receivable3;

public class Receivable2Command<REC1, REC2> extends ThreadCommand implements Receivable3<Receivable2<REC1, REC2>, REC1, REC2> {

    public Receivable2<REC1, REC2> child;
    public REC1 rec1;
    public REC2 rec2;

    @Override
    protected void threadBody() {
        child.receive(rec1, rec2);
    }

    @Override
    public void receive(Receivable2<REC1, REC2> child, REC1 rec1, REC2 rec2) {
        this.child = child;
        this.rec1 = rec1;
        this.rec2 = rec2;
    }
}

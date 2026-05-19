package jPlus.async.command;

public abstract class LoopThreadCommand extends ThreadCommand {

    protected boolean terminated = false;

    @Override
    protected final void initialize() {
        terminated = false;
        super.initialize();
    }

    @Override
    public final void terminate() {
        terminated = true;
        onTerminate();
    }

    //***************************************************************//

    @Override
    protected final void threadBody() {
        while (baseCondition() && condition()) loopBody();
        if (!terminated) onStandardEnd();
    }

    protected boolean baseCondition() {
        return !terminated;
    }

    protected abstract boolean condition();

    protected abstract void loopBody();

    protected void onStandardEnd() {
    }
}

package jPlus.async.command;

public abstract class LoopCommand extends Command {
    protected boolean terminated = false;

    @Override
    protected final void initialize() {
        terminated = false;
    }

    @Override
    public final void terminate() {
        terminated = true;
        super.terminate();
    }

    //***************************************************************//
    
    @Override
    public final void body(){
        while (isActive()) loopBody();
        if (!terminated) onStandardEnd();
    }

    public final boolean isActive() {
        return baseCondition() && condition();
    }

    protected boolean baseCondition() {
        return !terminated;
    }

    protected abstract boolean condition();

    protected abstract void loopBody();

    protected void onStandardEnd() {
    }
}

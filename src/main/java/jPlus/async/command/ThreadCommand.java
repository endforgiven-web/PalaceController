package jPlus.async.command;

import java.util.HashSet;
import java.util.Set;

import static jPlus.async.Threads.sleepBliss;

public abstract class ThreadCommand extends Command {
    protected Thread thread;

    //***************************************************************//

    @Override
    public final void run() {
        if (isDormant()) {
            super.run();
        } else onBusy();
    }

    @Override
    protected void initialize() {
        ACTIVE_THREAD_COMMANDS.add(this);
    }

    @Override
    protected final void body() {
        thread = new Thread(this::threadEP);
        thread.setDaemon(true);
        thread.start();
    }

    @Override
    protected final void end() {
    }

    protected void onBusy() {
    }

    @Override
    public void terminate() {
        if (isActive()) thread.interrupt();
        super.terminate();
    }

    //***************************************************************//

    protected void threadEP() {
        threadBody();
        close();
    }

    protected abstract void threadBody();

    protected final void close() {
        thread = null;
        ACTIVE_THREAD_COMMANDS.remove(this);
        onEnd.run();
    }


    public final boolean isDormant() {
        return thread == null;
    }

    public final boolean isActive() {
        return thread != null;
    }

    //***************************************************************//

    private static final Set<ThreadCommand> ACTIVE_THREAD_COMMANDS = new HashSet<>();
    private static final int TERMINATE_AND_WAIT_INCREMENT = 50;

    public static void terminateAll() {
        ACTIVE_THREAD_COMMANDS.forEach(ThreadCommand::terminate);
    }

    public static void terminateAllAndWait() {
        terminateAll();
        while (activeThreadCommandsExist()) sleepBliss(TERMINATE_AND_WAIT_INCREMENT);
    }

    public static boolean activeThreadCommandsExist() {
        return ACTIVE_THREAD_COMMANDS.size() > 0;
    }
}

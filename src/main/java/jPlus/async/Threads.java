package jPlus.async;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

public class Threads {
    public static final ScheduledExecutorService executorService = Executors.newSingleThreadScheduledExecutor();

    public static ScheduledFuture<?> later(Runnable run, int dur){
        return later(run, dur, TimeUnit.MILLISECONDS);
    }

    public static ScheduledFuture<?> later(Runnable run, int dur, TimeUnit tUnit){
        return executorService.schedule(run, dur, tUnit);
    }

    public static void sleepBliss(int millis, int nanos) {
        try {
            Thread.sleep(millis, nanos);
        } catch (InterruptedException ignored) {
        }
    }

    public static void sleepBliss(int millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException ignored) {
        }
    }

    public static void interruptibleSleep(int sleep) {
        try {
            Thread.sleep(sleep);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}

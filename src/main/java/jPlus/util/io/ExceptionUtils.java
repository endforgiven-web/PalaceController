package jPlus.util.io;

import jPlus.util.lang.KlassUtils;

public class ExceptionUtils {
    private static final String CALLER_FORMAT = "%s.%s() -- line %d";

    public static void catchAll(Runnable run) {

        final StackTraceElement prevStack = Thread.currentThread().getStackTrace()[2];
        final String callingKlass = KlassUtils.getKlass(prevStack.getClassName()).getSimpleName();
        final String callingMethod = prevStack.getMethodName();
        final int callingLineNumber = prevStack.getLineNumber();

        final String callerInfo = String.format(CALLER_FORMAT, callingKlass, callingMethod, callingLineNumber);

        System.out.println(ExceptionUtils.class.getSimpleName() + " CATCH-ALL");

        try {
            run.run();
            System.out.println("You have successfully solved this sendError!");
            System.out.println("Please remove this catchAll, if desired.");
        } catch (Throwable thrown) {
            System.err.println("Stack Trace:");
            thrown.printStackTrace();
        }
    }

}

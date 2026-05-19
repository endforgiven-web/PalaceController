package jPlus.util.lang;

import static jPlus.JPlus.sendError;

public class KlassUtils {
    public static Class<?> getKlass(String classLoaderName) {
        try {
            return Class.forName(classLoaderName);
        } catch (ClassNotFoundException ex) {
            sendError("Cannot find " + classLoaderName, ex);
        }

        return Object.class;
    }
}

package jPlus.util.io;

public class JarUtils {
    public static String version() {
        return version("DEVELOPMENT");
    }

    public static String version(String baseVersion) {
        final String ret = JarUtils.class.getPackage().getImplementationVersion();
        return ret == null ? baseVersion : ret;
    }

    public static String title() {
        final String ret = JarUtils.class.getPackage().getImplementationVersion();
        return ret == null ? "DEVTitle" : ret;
    }
}

package jPlus.io;

import java.io.File;

public class PathUtils {
    public static final String UNFORMATTED_PATH = String.format("%s%s%s",
            System.getProperty("user.dir"),
            File.separator, "%s");
}

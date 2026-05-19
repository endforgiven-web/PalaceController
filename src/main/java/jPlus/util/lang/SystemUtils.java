package jPlus.util.lang;

import jPlus.util.io.ConsoleUtils;

import java.io.File;

public class SystemUtils {

    public static String getDownloadFolderPath() {

        final String sep = File.separator;

        final String userName = getUserName();
        String downloadPath = null;

        switch (getOS()){
            case WINDOWS -> {
                downloadPath = "C:"+ sep + "Users" + sep + userName + sep + "Downloads";
            }
            case LINUX -> {
                downloadPath = "/home/"+userName+"/Downloads";
            }
            case MAC -> {
                downloadPath = "/Users/"+userName+"/Downloads";
            }
            case SOLARIS -> {
                downloadPath = "/home/username/Downloads";
            }
        }


        return downloadPath;
    }

    private static String getUserName() {

        String username = null;

        try {
            username = System.getProperty("user.name");
        } catch (SecurityException e) {
            System.err.println("Access to system properties denied: " + e.getMessage());
        }

        return username;
    }

    public enum OS {
        WINDOWS, LINUX, MAC, SOLARIS
    }

    private static OS OS = null;

    public static OS getOS() {
        if (OS == null) {
            String operSys = System.getProperty("os.name").toLowerCase();
            if (operSys.contains("win")) {
                OS = OS.WINDOWS;
            } else if (operSys.contains("nix") || operSys.contains("nux")
                    || operSys.contains("aix")) {
                OS = OS.LINUX;
            } else if (operSys.contains("mac")) {
                OS = OS.MAC;
            } else if (operSys.contains("sunos")) {
                OS = OS.SOLARIS;
            }
        }
        return OS;
    }
}

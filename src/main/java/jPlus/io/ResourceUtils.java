package jPlus.io;

import jPlus.io.file.DirUtils;

import java.io.*;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;

import static jPlus.JPlus.sendError;

public final class ResourceUtils {

    public static List<String> read(String path) {
        return read(asStream(path));
    }

    public static List<String> read(InputStream inputStream) {
        final List<String> ret = new ArrayList<>();
        if (inputStream != null) {
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream))) {
                String text;
                while ((text = reader.readLine()) != null) ret.add(text);
            } catch (IOException ex) {
                sendError("Cannot read input stream", ex);
            }
        }

        return ret;
    }

    public static InputStream asStream(String path) {
        return ResourceUtils.class.getClassLoader().getResourceAsStream(path);
    }

    //***************************************************************//

    public static void toFile(String name) {
        toFile(name, DirUtils.fromUser(name));
    }

    public static File toFile(String name, String pathS) {
        try (InputStream is = ResourceUtils.asStream(name)) {
            final Path path = Paths.get(pathS);
            final File file = path.toFile();
            if (!file.exists()) Files.copy(is, path, StandardCopyOption.REPLACE_EXISTING);
            return file;
        } catch (IOException ex) {
            sendError("Cannot create file " + name + " from resource at " + pathS, ex);
        }

        return new File(pathS);
    }

    public static File[] getDirFiles(String dirPath) {
        final ClassLoader loader = Thread.currentThread().getContextClassLoader();
        final URL url = loader.getResource(dirPath);
        if (url != null) {
            String path = url.getPath();
            return new File(path).listFiles();
        }

        return null;
    }

    public static int getDirFileCount(String dirPath) {
        final File[] files = getDirFiles(dirPath);
        return files == null ? 0 : files.length;
    }
}

package jPlus.io.file;

import jPlus.JPlus;
import jPlus.lang.callback.Receivable1;
import jPlus.lang.callback.Retrievable1;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class DirUtils {

    private static final Set<FileVisitOption> FILE_VISIT_OPTIONS = Arrays.stream(FileVisitOption.values()).collect(Collectors.toSet());

    public static File makeAndGet(File dir) {
        return dir.exists() || dir.mkdirs() ? dir : null;
    }

    public static File makeAndGet(String path) {
        return makeAndGet(new File(path));
    }

    public static File[] makeAndGet(String... paths) {
        final File[] ret = new File[paths.length];
        for (int i = 0; i < paths.length; i++) ret[i] = makeAndGet(paths[i]);
        return ret;
    }

    //***************************************************************//

    public static void empty(File dir) {
        final File[] files = dir.listFiles();
        if (files != null && files.length > 0) FileUtils.delete(files);
    }

    public static boolean delete(File dir) {
        boolean ret = true;
        dir.deleteOnExit();
        final File[] files = dir.listFiles();
        if (files != null)
            for (File file : files)
                ret &= delete(file);
        return ret && dir.delete();
    }

    public static String fromUser(String path) {
        return System.getProperty("user.dir") + File.separatorChar + path;
    }

    public static File fromUserFile(String path) {
        return new File(fromUser(path));
    }

    /**************************************************************************/

    public static void rename(String path, String newName) throws IOException {
        rename(Paths.get(path), newName);
    }

    public static void rename(Path path, String newName) throws IOException {
        Files.move(path, path.resolveSibling(newName), StandardCopyOption.REPLACE_EXISTING);
    }

    public static void renameBliss(Path path, String newName) {
        try {
            rename(path, newName);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static long length(File file) {
        return length(file.toPath());
    }

    public static long length(Path path) {
        try (final Stream<Path> walkPath = Files.walk(path)) {
            return walkPath.mapToLong(p -> p.toFile().length()).sum();
        } catch (IOException e) {
            JPlus.sendError("Cannot determine directory length", e);
        }

        return 0;
    }

    /**************************************************************************/

    public static void copy(Path source, Path target, CopyOption... options)
            throws IOException {
        copy(source, target, 1, options);
    }

    public static void copy(Path source, Path target, int maxDepth, CopyOption... options)
            throws IOException {
        copy(source, target, (file) -> true, (file) -> true, maxDepth, options);
    }

    public static void copy(Path source, Path target,
                            Retrievable1<Boolean, Path> folderCB,
                            Retrievable1<Boolean, Path> fileCB, CopyOption... options)
            throws IOException {
        copy(source, target, folderCB, fileCB, Integer.MAX_VALUE, options);
    }

    public static void copy(Path source, Path target, Retrievable1<Boolean, Path> folderCB, Retrievable1<Boolean, Path> fileCB, int maxDepth, CopyOption... options)
            throws IOException {
        Files.walkFileTree(source, FILE_VISIT_OPTIONS, maxDepth, new SimpleFileVisitor<>() {

            @Override
            public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs)
                    throws IOException {
                final Path newDirPath = target.resolve(source.relativize(dir));
                if (folderCB == null || folderCB.retrieve(newDirPath))
                    Files.createDirectories(newDirPath);
                return FileVisitResult.CONTINUE;
            }

            @Override
            public FileVisitResult visitFile(Path path, BasicFileAttributes attrs)
                    throws IOException {
                final Path targetPath = target.resolve(source.relativize(path));

                if (fileCB == null || fileCB.retrieve(targetPath))
                    Files.copy(path, targetPath, options);
                return FileVisitResult.CONTINUE;
            }
        });
    }

    /**************************************************************************/

    public static void iterate(File folder, Receivable1<File> rec) {
        if (folder.exists()) {
            final File[] files = folder.listFiles();
            if (files != null)
                for (File file : files)
                    rec.receive(file);
        }
    }
}

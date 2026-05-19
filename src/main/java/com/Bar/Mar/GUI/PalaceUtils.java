package com.Bar.Mar.GUI;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class PalaceUtils {
    public static void updateMasterList(String directoryPath) throws IOException {
        final String masterListName = "master_list.txt";
        Path dir = Paths.get(directoryPath);
        Path masterFile = dir.resolve(masterListName);

        // 1. Get existing entries to avoid duplicates (The "Pointer" check)
        Set<String> existingEntries = new HashSet<>();
        if (Files.exists(masterFile)) {
            existingEntries.addAll(Files.readAllLines(masterFile));
        }

        // 2. Scan and Sort files by creation/modified time
        List<String> newEntries = Files.list(dir)
                .filter(path -> !Files.isDirectory(path))
                .filter(path -> path.toString().endsWith(".txt"))
                .filter(path -> !path.getFileName().toString().equals(masterListName))
                .sorted(Comparator.comparingLong(p -> p.toFile().lastModified()))
                .map(path -> path.getFileName().toString())
                .filter(name -> !existingEntries.contains(name)) // Only grab what's missing
                .collect(Collectors.toList());

        // 3. Functional Append
        if (!newEntries.isEmpty()) {
            Files.write(masterFile, newEntries, StandardOpenOption.CREATE, StandardOpenOption.APPEND);
            System.out.println("Added " + newEntries.size() + " new souls to the log.");
    }
    }
}

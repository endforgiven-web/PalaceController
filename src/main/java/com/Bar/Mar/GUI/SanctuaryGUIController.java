package com.Bar.Mar.GUI;

import com.Bar.Mar.Main;
import com.Bar.Mar.util.BrowserUtils;
import javafx.application.Platform;
import javafx.concurrent.Task;
import javafx.fxml.FXML;
import javafx.scene.control.*;

import java.io.IOException;
import java.nio.file.*;

public class SanctuaryGUIController {

    public static SanctuaryGUIController INST;
    protected static Path currentPath;

    @FXML protected Label statusLabel;
    @FXML protected ListView<String> watchServiceList;
    @FXML protected RadioButton cloudRadio;
    @FXML protected RadioButton localRadio;
    @FXML protected Button commitButton;

    protected WatchService watcher;

    protected Thread thread;

    @FXML
    public void initialize() {
        try {
            // 1. Create the WatchService
            this.watcher = FileSystems.getDefault().newWatchService();

            // 2. Set the default path (Your 'raw' folder)
            updatePath(Paths.get(Main.config.cloudConvPath));

            // 3. Populate the list with existing files so it's not empty at start
            loadExistingFiles();

        } catch (Exception e) {
            e.printStackTrace();
        }

        INST = this;
    }

    /******* WATCHER LIST **********/
    private void updatePath(Path newPath) {
        try {
            this.currentPath = newPath;
            statusLabel.setText("Watching: " + newPath.getFileName());

            // This is the "glue" you were missing!
            // It registers the directory for creates, deletes, and modifications.
            newPath.register(watcher,
                    StandardWatchEventKinds.ENTRY_CREATE,
                    StandardWatchEventKinds.ENTRY_DELETE,
                    StandardWatchEventKinds.ENTRY_MODIFY);

            if (thread == null || !thread.isAlive()) {
                thread = new Thread(watchTask);
                thread.setDaemon(true); // Ensures the thread stops when the app closes
                thread.start();
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void loadExistingFiles() {
        try (DirectoryStream<Path> stream = Files.newDirectoryStream(currentPath)) {
            for (Path entry : stream) {
                if (!entry.getFileName().toString().startsWith(".")) {
                    watchServiceList.getItems().add(entry.getFileName().toString());
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    Task<Void> watchTask = new Task<>() {
        @Override
        protected Void call() throws Exception {
            WatchKey key;
            while ((key = watcher.take()) != null) {
                for (WatchEvent<?> event : key.pollEvents()) {
                    // This is where "Allegory To the Cave.txt" becomes real!
                    final String fileName = event.context().toString();
                    if (!fileName.startsWith(".")) {
                        Platform.runLater(() -> {
                            watchServiceList.getItems().add(0, fileName);
                        });
                    }
                }
                key.reset();
            }
            return null;
        }
    };


    /***** TEST ********/
    @FXML
    public void doTestAction() throws InterruptedException {
        final String gemLink = "https://gemini.google.com";
            BrowserUtils.openCurrBrowser(gemLink);
            Thread.sleep(2000);

    }



    /***** COMMIT *****/
    @FXML
    public void handleCommitAndPush() {
        statusLabel.setText("Syncing to Sanctuary...");
        final Task<Void> gitTask = commitAndPush();
        gitTask.setOnSucceeded(e -> INST.statusLabel.setText("Sanctuary Synced! Smooch! :D"));
        gitTask.setOnFailed(e -> INST.statusLabel.setText("Sync failed. Check terminal."));
    }

    public static Task<Void> commitAndPush(){
        Task<Void> gitTask = new Task<>() {
            @Override
            protected Void call() throws Exception {
                // Define the commands to run in your 'raw' directory
                runCommand("git", "add", ".");
                runCommand("git", "commit", "-m", "Manual Sanctuary Sync: " + java.time.LocalDateTime.now());
                runCommand("git", "push", "origin", "master");
                return null;
            }
        };
        new Thread(gitTask).start();

        return gitTask;
    }

    public static void runCommand(String... command) throws Exception {
        ProcessBuilder builder = new ProcessBuilder(command);
        builder.directory(Path.of(Main.config.cloudGitPath).toFile()); // Runs in your 'raw' folder
        Process process = builder.start();
        process.waitFor(); // Wait for each step to finish before starting the next
    }


    /** Master List **/
    public void handleCreateMasterList(){
        try {
            PalaceUtils.updateMasterList(Main.config.cloudConvPath);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}

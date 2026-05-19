package com.Bar.Mar.spring;

import java.io.*;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class PalaceScheduler {

    protected final Map<ServerStatus, List<LocalTime>> schedule = new HashMap<>();
    protected Map<String, String> completionLog = new HashMap<>();
    protected final String logFile = "palace_schedule_log.dat";

    // Tracks when a task was handed out: "Task_Time" -> HandoutTimestamp
    private final Map<String, LocalDateTime> lockedTasks = new HashMap<>();
    private final long LOCK_TIMEOUT_MINUTES = 20;

    public PalaceScheduler() {
        loadCompletionLog();
        schedule.put(ServerStatus.SCRAPE, List.of(
                LocalTime.of(6, 0), LocalTime.of(18, 0)
        ));
    }

    public List<String> getDueTasks() {
        List<String> due = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (Map.Entry<ServerStatus, List<LocalTime>> entry : schedule.entrySet()) {
            ServerStatus task = entry.getKey();

            for (LocalTime slot : entry.getValue()) {
                LocalDateTime targetTime = LocalDateTime.of(LocalDate.now(), slot);
                String slotKey = task.name() + "_" + slot.toString();

                // 1. Is it time to run?
                if (now.isAfter(targetTime)) {

                    // 2. Has it been successfully confirmed today?
                    String lastSuccess = completionLog.getOrDefault(slotKey, "");
                    if (lastSuccess.startsWith(LocalDate.now().toString())) {
                        continue; // Already done today!
                    }

                    // 3. Is it currently "Locked" (already handed out recently)?
                    if (lockedTasks.containsKey(slotKey)) {
                        LocalDateTime lockoutTime = lockedTasks.get(slotKey);
                        if (Duration.between(lockoutTime, now).toMinutes() < LOCK_TIMEOUT_MINUTES) {
                            continue; // Still in the 20-minute waiting room
                        }
                    }

                    // 4. If we got here, it's due and NOT locked!
                    due.add(task.toString());
                    lockedTasks.put(slotKey, now); // Lock it!

                    // Break after finding one due slot for this task to avoid double-returns
                    break;
                }
            }
        }
        return due;
    }

    /**
     * Call this when the Spring endpoint confirms a 200 OK!
     */

    public void confirmTaskSuccess(ServerStatus task) {
        confirmTaskSuccess(task, LocalTime.now());
    }

    public void confirmTaskSuccess(ServerStatus task, LocalTime slot) {
        String slotKey = task.name() + "_" + slot.toString();
        completionLog.put(slotKey, LocalDateTime.now().toString());
        lockedTasks.remove(slotKey); // Clear the lock immediately
        saveCompletionLog();
    }

    protected void saveCompletionLog() {
        try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream(logFile))) {
            oos.writeObject(completionLog);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @SuppressWarnings("unchecked")
    private void loadCompletionLog() {
        File file = new File(logFile);
        if (file.exists()) {
            try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream(file))) {
                completionLog = (Map<String, String>) ois.readObject();
            } catch (Exception e) {
                completionLog = new HashMap<>();
            }
        }
    }
}
package com.Bar.Mar.spring;

import com.Bar.Mar.GUI.PalaceUtils;
import com.Bar.Mar.GUI.SanctuaryGUIController;
import com.Bar.Mar.Main;
import jPlus.io.file.FileUtils;
import jPlusLibs.spring.HTTPUtils;
import javafx.application.Platform;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.AsyncResult;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.lang.reflect.Array;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Future;

@Controller
@CrossOrigin
public class SanctuarySpringController {

    final PalaceScheduler scheduler = new PalaceScheduler();

    //    @Async
    @RequestMapping(value = "/serverStatus",
            method = RequestMethod.POST,
            headers = "Accept=application/json")
    public Future<ResponseEntity<Map<String, Object>>> getStatus() {

        final Map<String, Object> json = new HashMap<>();

        json.put("serverStatus", scheduler.getDueTasks());
        json.put("status", 400);

        System.out.println("serverStatus tasks: " + json.get("serverStatus").toString());

        return new AsyncResult<>(HTTPUtils.jsonCreate(json));
    }

    /** MASTER **/
    @RequestMapping(value = "/master",
            method = RequestMethod.POST,
            headers = "Accept=application/json")
    public Future<ResponseEntity<Map<String, Object>>> getMaster() {

        final Map<String, Object> json = new HashMap<>();

        final String[] masterList = getMasterList();

        json.put("resp", masterList);
        json.put("status", 400);

        return new AsyncResult<>(HTTPUtils.jsonCreate(json));
    }

    public static String[] getMasterList(){
        final String sep = File.separator;
        final String masterListPath = Main.config.cloudConvPath + sep + "master_list.txt";

        return FileUtils.read(masterListPath).toArray(String[]::new);
    }

    /** UPLOAD **/
    @RequestMapping(value = "/uploadCloudConv",
            method = RequestMethod.POST,
            headers = "Accept=application/json")
    public Future<ResponseEntity<Map<String, Object>>> uploadCloudConv(@RequestParam("files") List<MultipartFile> files) {
        final String sep = File.separator;

        files.forEach(f -> {
            try {
                File convFile = new File(Main.config.cloudConvPath + sep + f.getOriginalFilename());

                System.out.println(convFile.getAbsolutePath());

                // Create the file and write the bytes
                if (convFile.createNewFile()) {
                    try (FileOutputStream fos = new FileOutputStream(convFile)) {
                        fos.write(f.getBytes());
                    }
                }


            } catch (IOException e) {
                System.err.println("Failed to archive: " + f.getOriginalFilename());
                e.printStackTrace();
            }
        });

        try {
            PalaceUtils.updateMasterList(Main.config.cloudConvPath);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        SanctuaryGUIController.commitAndPush();

        scheduler.confirmTaskSuccess(ServerStatus.SCRAPE);

        final Map<String, Object> json = new HashMap<>();

        json.put("resp", "success!");
        json.put("status", 400);

        return new AsyncResult<>(HTTPUtils.jsonCreate(json));
    }
}

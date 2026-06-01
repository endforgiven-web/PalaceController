package com.Bar.Mar.spring;

import com.Bar.Mar.Main;
import jPlusLibs.spring.HTTPUtils;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.AsyncResult;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Future;

@Controller
@CrossOrigin
public class SanctuaryChatPullerController {

    @GetMapping("/masterFile")
    public ResponseEntity<byte[]> downloadMasterList() {
        // 1. Generate or fetch your master list content
        String masterListJson = "{\"status\": \"active\", \"items\": []}"; // Replace with your actual data logic
        byte[] fileBytes = masterListJson.getBytes(StandardCharsets.UTF_8);

        // 2. Set up headers to treat this as an attached file
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setContentDisposition(ContentDisposition.attachment()
                .filename("palace_master_list.json")
                .build());

        return new ResponseEntity<>(fileBytes, headers, HttpStatus.OK);
    }
/*
    @RequestMapping(value = "/pullFiles",
            method = RequestMethod.POST,
            headers = "Accept=application/json")
    public Future<ResponseEntity<Map<String, Object>>> pullFiles(@RequestBody Map<String, Object> payload) {

        Map<String, Object> responseJson = new HashMap<>();

        try {
            // 1. Extract requested file names and the optional limit from the incoming payload
            List<String> requestedFiles = (List<String>) payload.get("fileNames");
            Integer limit = (Integer) payload.getOrDefault("limit", 20); // Defaults to 20 if not specified

            // 2. Fetch the base archive directory path from your config setup
            // (Adjusting to how PalaceConfig exposes the path, e.g., PalaceConfig.getArchivePath())
            String baseDirectoryPath = Main.config.cloudConvPath;

            List<Map<String, String>> retrievedFilesData = new ArrayList<>();
            int count = 0;

            if (requestedFiles != null) {
                for (String fileName : requestedFiles) {
                    if (count >= limit) {
                        break; // Stop if we hit the user-defined or default limit
                    }

                    File file = new File(baseDirectoryPath, fileName);
                    if (file.exists() && file.isFile()) {
                        Map<String, String> fileInfo = new HashMap<>();
                        fileInfo.put("fileName", file.getName());

                        // Read the text content of the file (assuming text/JSON logs)
                        String content = new String(Files.readAllBytes(file.toPath()), "UTF-8");
                        fileInfo.put("content", content);

                        retrievedFilesData.add(fileInfo);
                        count++;
                    }
                }
            }

            responseJson.put("status", 200);
            responseJson.put("filesProcessed", count);
            responseJson.put("files", retrievedFilesData);

        } catch (Exception e) {
            responseJson.put("status", 500);
            responseJson.put("error", "Failed to retrieve files: " + e.getMessage());
            e.printStackTrace();
        }

        System.out.println("Sanctuary Chat Puller processed " + responseJson.getOrDefault("filesProcessed", 0) + " files.");
        return new AsyncResult<>(HTTPUtils.jsonCreate(responseJson));
    }
    */
}

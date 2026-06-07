package com.Bar.Mar.spring;

import com.Bar.Mar.Main;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Controller
@CrossOrigin
public class SanctuaryChatPullerController {

    @Autowired
    private ObjectMapper objectMapper; // Spring provides this automatically

    @GetMapping("/masterFile")
    public ResponseEntity<byte[]> downloadMasterList() {
        try {
            // 1. Point to the exact path where your master list file lives on your disk
            // Replace this string with your actual local file path (e.g., "/Users/marcus/Documents/palace_master.json")
            final String sep = File.separator;
            final String masterListPath = Main.config.cloudConvPath + sep + "master_list.txt";
            Path filePath = Paths.get(masterListPath);

            // 2. Read all the bytes directly from the file system
            byte[] fileBytes = Files.readAllBytes(filePath);

            System.out.println("Serving Master List File - Size: " + fileBytes.length + " bytes");

            // 3. Set up the headers so the frontend treats it as a clean attachment
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setContentLength(fileBytes.length);
            headers.setContentDisposition(ContentDisposition.attachment()
                    .filename(filePath.getFileName().toString())
                    .build());

            return new ResponseEntity<>(fileBytes, headers, HttpStatus.OK);

        } catch (java.nio.file.NoSuchFileException e) {
            System.err.println("Could not find the master file at the specified path!");
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
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

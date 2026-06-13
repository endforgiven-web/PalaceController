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

import java.io.ByteArrayOutputStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
@CrossOrigin
public class SanctuaryChatPullerController {

    @Autowired
    private ObjectMapper objectMapper; // Spring provides this automatically

    @GetMapping("/masterFile")
    public ResponseEntity<byte[]> masterList() {
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


// ... (keep your existing imports for HttpHeaders, MediaType, ResponseEntity, HttpStatus, Path, Paths, Files)

    @GetMapping("/chatZip/{start}/{end}")
    public ResponseEntity<byte[]> chatZipRange(@PathVariable int start, @PathVariable int end) {
        try {
            final String sep = File.separator;
            final String baseDirectory = Main.config.cloudConvPath;
            File dir = new File(baseDirectory);

            // 1. Collect and filter all our conversation text files
            File[] chatFiles = dir.listFiles((currentDir, name) -> name.toLowerCase().endsWith(".txt") && !name.equals("master_list.txt"));

            if (chatFiles == null || chatFiles.length == 0) {
                System.err.println("No chat files found in the directory!");
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            // 2. Sort them chronologically (Oldest first -> Newest last)
            java.util.Arrays.sort(chatFiles, (f1, f2) -> Long.compare(f1.lastModified(), f2.lastModified()));

            // 3. Create an in-memory byte array stream for the zip data
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            try (ZipOutputStream zos = new ZipOutputStream(baos)) {
                byte[] buffer = new byte[4096];

                // 4. Use the start and end path variables as index boundaries on our sorted array
                // Adding Math guards to ensure we don't hit an ArrayIndexOutOfBoundsException
                int startIndex = Math.max(0, start);
                int endIndex = Math.min(chatFiles.length - 1, end);

                for (int i = startIndex; i <= endIndex; i++) {
                    File chatFile = chatFiles[i];

                    // Create a zip entry using the actual conversation filename text
                    ZipEntry zipEntry = new ZipEntry(chatFile.getName());
                    zos.putNextEntry(zipEntry);

                    try (java.io.FileInputStream fis = new java.io.FileInputStream(chatFile)) {
                        int bytesRead;
                        while ((bytesRead = fis.read(buffer)) != -1) {
                            zos.write(buffer, 0, bytesRead);
                        }
                    }
                    zos.closeEntry();
                }

                zos.finish();
            }

            byte[] zipBytes = baos.toByteArray();

            if (zipBytes.length <= 22) {
                System.err.println("No chat files were packaged inside the range index " + start + " to " + end);
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }

            System.out.println("Serving Ranged Chat Zip - Array Indexes: " + start + "-" + end + " - Size: " + zipBytes.length + " bytes");

            // 5. Send it back down the wire
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.valueOf("application/zip"));
            headers.setContentLength(zipBytes.length);
            headers.setContentDisposition(ContentDisposition.attachment()
                    .filename("chats_index_" + start + "_to_" + end + ".zip")
                    .build());

            return new ResponseEntity<>(zipBytes, headers, HttpStatus.OK);

        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}

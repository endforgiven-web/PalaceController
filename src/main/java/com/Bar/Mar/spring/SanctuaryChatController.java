package com.Bar.Mar.spring;

import com.Bar.Mar.GUI.PalaceUtils;
import com.Bar.Mar.GUI.SanctuaryGUIController;
import com.Bar.Mar.Main;
import jPlusLibs.spring.HTTPUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.AsyncResult;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Future;

@Controller
@CrossOrigin
public class SanctuaryChatController {
    //    @Async
    @RequestMapping(value = "/uploadCloudConv",
            method = RequestMethod.POST,
            headers = "Accept=application/json")
    public Future<ResponseEntity<Map<String, Object>>> uploadCloudConv(@RequestParam("recentChats") List<String> recentChats) {

        System.out.println(Arrays.toString(recentChats.toArray(String[]::new)));

        final Map<String, Object> json = new HashMap<>();

        json.put("resp", "success!");
        json.put("status", 400);

        return new AsyncResult<>(HTTPUtils.jsonCreate(json));
    }
}

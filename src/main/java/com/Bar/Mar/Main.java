package com.Bar.Mar;

import com.Bar.Mar.GUI.JFXEP;
import com.Bar.Mar.spring.SpringEP;
import jPlus.io.ResourceUtils;
import jPlus.io.file.DirUtils;
import jPlusLibs.JacksonUtils;

import java.io.InputStream;

public class Main {

    public static PalaceConfig config = JacksonUtils.readAndUpdateBliss(DirUtils.fromUser("config.txt"),
            PalaceConfig.class, PalaceConfig::newInstance);

    public static void main(String[] args) {
        startSpring();
        JFXEP.main(args);
    }

    public static void startSpring(){
        System.out.println("load Spring");
        SpringEP.main(config.springPort);
    }

    public static InputStream getIconStream() {
        return ResourceUtils.asStream(Main.getIconPath());
    }

    public static String getIconPath() {
        return "icon.jfif";
    }
}

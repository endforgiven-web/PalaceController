package com.Bar.Mar;

import jPlus.util.lang.SystemUtils;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

public class PalaceConfig {

    public String springPort = "20000";
    public String cloudGitPath = SystemUtils.getDownloadFolderPath();
    public String cloudConvPath = SystemUtils.getDownloadFolderPath();

    public List<String> scrapeTimes  = List.of("06:00", "18:00");

    public List<LocalTime> scrapeTimes(){
        return scrapeTimes
                .stream()
                .map(str -> LocalTime.parse(str, DateTimeFormatter.ofPattern("HH:mm")))
                .collect(Collectors.toList());
    }

    public static PalaceConfig newInstance() {
        return new PalaceConfig();
    }
}

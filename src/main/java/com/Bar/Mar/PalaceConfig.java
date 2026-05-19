package com.Bar.Mar;

import jPlus.util.lang.SystemUtils;

public class PalaceConfig {

    public String springPort = "55555";
    public String cloudGitPath = SystemUtils.getDownloadFolderPath();
    public String cloudConvPath = SystemUtils.getDownloadFolderPath();

    public static PalaceConfig newInstance() {
        return new PalaceConfig();
    }
}

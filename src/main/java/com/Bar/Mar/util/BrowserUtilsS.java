package com.Bar.Mar.util;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;

import java.util.HashSet;
import java.util.Set;

public class BrowserUtilsS {


    public static WebDriver driver = new ChromeDriver();

    public static Set<String> getDefaultBrowserUrls(){

        final Set<String> windowHandles = driver.getWindowHandles();
        final Set<String> ret = new HashSet<>();

        for (String handle : windowHandles) {
            driver.switchTo().window(handle);
            final String url = driver.getCurrentUrl();
            ret.add(url);
        }

        return ret;
    }
}

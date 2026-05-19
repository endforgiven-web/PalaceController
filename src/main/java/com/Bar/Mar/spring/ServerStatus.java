package com.Bar.Mar.spring;

public enum ServerStatus {
    SCRAPE("scrape");

    public final String name;

    ServerStatus(String name) {
        this.name = name;
    }

    @Override
    public String toString() {
        return this.name;
    }
}

package jPlus.io.file;

import java.io.File;
import java.net.URI;
import java.util.Objects;

public class MediaFile extends File {
    private final int duration;

    public MediaFile(String pathname, int duration) {
        super(pathname);
        this.duration = duration;
    }

    public MediaFile(String parent, String child, int duration) {
        super(parent, child);
        this.duration = duration;
    }

    public MediaFile(File parent, String child, int duration) {
        super(parent, child);
        this.duration = duration;
    }

    public MediaFile(URI uri, int duration) {
        super(uri);
        this.duration = duration;
    }

    public int getDuration() {
        return duration;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof MediaFile)) return false;
        if (!super.equals(o)) return false;
        MediaFile mediaFile = (MediaFile) o;
        return duration == mediaFile.duration;
    }

    @Override
    public int hashCode() {
        return Objects.hash(super.hashCode(), duration);
    }
}

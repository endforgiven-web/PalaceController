package jPlusLibs.Maven;

import java.io.IOException;
import java.util.jar.Attributes;
import java.util.jar.Manifest;

public class MavenUtils {

    public static String NEUTRAL_V = "Dev";

    public static String getPomVersion() {
        try {
            return getManifest()
                    .getMainAttributes()
                    .get(Attributes.Name.IMPLEMENTATION_VERSION).toString();
        } catch (Exception e) {
            System.err.println("Dev Version");
        }

        return NEUTRAL_V;
    }

    public static Manifest getManifest() throws IOException {
        return new Manifest(MavenUtils.class.getResourceAsStream("/META-INF/MANIFEST.MF"));
    }

    public static String getPomName() {
        try {
            return getManifest()
                    .getMainAttributes()
                    .get(Attributes.Name.IMPLEMENTATION_TITLE).toString();
        } catch (Exception e) {
            System.err.println("No extension name");
        }

        return NEUTRAL_V;
    }
}

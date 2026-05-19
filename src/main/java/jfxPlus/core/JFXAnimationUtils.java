package jfxPlus.core;

import javafx.animation.Animation;
import javafx.animation.Interpolator;
import javafx.animation.Transition;
import javafx.stage.Stage;
import javafx.util.Duration;

public class JFXAnimationUtils {
    public static void stageSizeTransition(Stage stage, Duration dur, double width, double height) {
        Animation transition = new Transition() {
            {
                setCycleDuration(dur);
                setInterpolator(Interpolator.EASE_IN);
            }

            @Override
            protected void interpolate(double frac) {
                stage.setWidth(width * frac);
                stage.setHeight(height * frac);
//                stage.setX(x * frac);
//                stage.setY(y * frac);
            }
        };
        transition.play();
    }
}

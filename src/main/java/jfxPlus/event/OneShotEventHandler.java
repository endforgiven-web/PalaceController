package jfxPlus.event;

import javafx.event.Event;
import javafx.event.EventHandler;

public class OneShotEventHandler<T extends Event> {

    protected EventHandler<T> oneShotEvent;
    protected EventHandler<T> defaultEvent = e -> {
    };

    public OneShotEventHandler() {
    }

    public OneShotEventHandler(final EventHandler<T> event) {
        loadOneShot(event);
    }

    public void loadOneShot(final EventHandler<T> event) {
        this.oneShotEvent = t -> {
            event.handle(t);
            this.oneShotEvent = this.defaultEvent;
        };
    }

    public void handle(final T e){
        oneShotEvent.handle(e);
    }

    public EventHandler<T> getDefaultEvent() {
        return defaultEvent;
    }

    public void setDefaultEvent(EventHandler<T> defaultEvent) {
        this.defaultEvent = defaultEvent;
    }
}

class ScrollUtils{
    static TOP(el) {
        el.scrollTo(0.0, 0.0);
    }

    static BOTTOM(el) {
        el.scrollTo(0, el.scrollHeight);
    }
}
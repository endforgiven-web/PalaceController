class MathUtils {
    static closest() {
        const closest = counts.reduce(function (prev, curr) {
            return (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
        });
        return closest;
    }
}
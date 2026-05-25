class MathUtils {
    /**
     * Finds the number in an array closest to a target goal.
     * @param counts - An array of numbers to search through
     * @param goal - The target number to approach
     * @returns The number from the array closest to the goal
     */
    static closest(counts: number[], goal: number): number {
        const closest = counts.reduce((prev: number, curr: number): number => {
            return Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev;
        });
        
        return closest;
    }
}
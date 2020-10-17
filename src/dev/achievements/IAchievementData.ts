/**
 * Object representing data of achievement
 */
interface IAchievementData {
    /**
     * Achievement completion progress
     * @see <i>AchievementAPI.getProgress</i>
     */
    progress: number;

    /**
     * Custom data
     * @see <i>AchievementAPI.getData</i>
     */
    data: object;
}
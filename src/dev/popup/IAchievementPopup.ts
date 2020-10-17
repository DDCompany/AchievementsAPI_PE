/**
 * Object representing popup
 */
interface IAchievementPopup {
    /**
     * First line of the popup
     */
    title: string

    /**
     * Second line of the popup
     */
    description: string

    /**
     * Color of title
     * @default <i>android.graphics.Color.YELLOW</i>
     */
    color?: number

    /**
     * Icon of the popup
     * @default empty item
     */
    item?: { id?: number, count?: number, data?: number }

    /**
     * Time in ticks that popup will be on the screen
     * @default <i>AchievementAPI.DEFAULT_DELAY</i>
     */
    delay?: number
}
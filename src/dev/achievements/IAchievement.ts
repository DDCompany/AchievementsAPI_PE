enum Connection {
    NONE = "none",
    VERTICAL = "vertical",
    HORIZONTAL = "horizontal"
}

interface IItemIcon {
    id: number,
    data?: number
}

interface IAchievement {
    /**
     * Unique identifier
     */
    uid: string;

    /**
     * Name of the achievement
     */
    name?: string;

    /**
     * Description of the achievement
     */
    description?: string;

    /**
     * Set the column in which the achievement will be located
     */
    column?: number;

    /**
     * Set the row in which the achievement will be located
     */
    row?: number;

    /**
     * X coordinate in area
     */
    x?: number;

    /**
     * Y coordinate in area
     */
    y?: number;

    /**
     * Parent achievement. If contains in the current group, the achievements will be connected by a line
     */
    parent?: string;

    /**
     * If true, the achievements will not be displayed until parent achievement is not completed
     * @default <i>false</i>
     */
    hidden?: boolean;

    /**
     * Affects on the texture of frame and the popup title. To create custom, you need to create 'achievements_bg'
     * folder in GUI resources directory and place the textures in it with the following suffixes: '_completed',
     * '_locked' and 'unlocked'
     * @default <i>AchievementType.default</i>
     */
    type?: AchievementType | string;

    /**
     * Max progress. When calling method <i>AchievementAPI.give</i>, the special counter will increased by one until
     * the maximum value is equal, after which the achievement will be completed. Use
     * <i>AchievementAPI.getData().progress</i> to get current progress value
     */
    progressMax?: number;

    /**
     * Do not show popup when achievement completed?
     * @default <i>true</i>
     */
    showPopup?: boolean;

    /**
     * Achievement icon
     */
    icon?: number | IItemIcon;

    /**
     * Specifies the sides to which the connection will be connected
     * @default <i>Connection.HORIZONTAL</i>
     */
    connection?: Connection
}

interface IConvertedAchievement extends IAchievement {
    icon?: IItemIcon
}
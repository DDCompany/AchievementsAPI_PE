interface IAchievementGroup {
    /**
     * Unique string identifier of the group
     */
    uid: string;

    /**
     * Name of the group
     * @default empty string
     */
    name?: string;

    /**
     * Achievements area width
     * @default 600
     */
    width?: number;

    /**
     * Achievements area height
     * @default 250
     */
    height?: number;

    /**
     * Achievement icons size
     * @default 100
     */
    size?: number;

    /**
     * Path to the texture in resource directory, which is used as the background of the achievement area. This texture
     * is scaled to 80 units and duplicated in width and height. Recommended size - 16x16
     * @default empty string
     */
    background?: string;

    /**
     * Group icon
     */
    icon?: number | IItemIcon
}
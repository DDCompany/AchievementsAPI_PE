class AchievementAPI {
    /**
     * Array of registered groups by <i>AchievementAPI.registerGroup</i>
     */
    static groups: Record<string, AchievementGroup> = {};

    /**
     * Register new group
     * @param description - description object
     */
    static registerGroup(description: IAchievementGroup): AchievementGroup {
        const group = new AchievementGroup(description);

        if (this.groups[group.uid]) {
            throw new IllegalArgumentException(`Group with uid "$\{uid}" already registered`);
        }

        this.groups[group.uid] = group;
        AchievementsUI.groupNames.push(description.uid);
        return group;
    }

    /**
     * Register new achievement
     * @param uid - group unique identifier
     * @param description - description object
     */
    static register(uid: string, description: IAchievement): Achievement {
        const group = this.groups[uid];
        if (!group) {
            throw new IllegalArgumentException("Invalid group uid");
        }

        let achievement = new Achievement(group, description);
        group.addChild(achievement);
        return achievement;
    }

    /**
     * Register array of achievements
     * @param uid - group unique identifier
     * @param descriptions - descriptions array
     */
    static registerAll(uid: string, descriptions: IAchievement[]) {
        for (let description of descriptions) {
            AchievementAPI.register(uid, description);
        }
    }

    //noinspection JSUnusedGlobalSymbols
    /**
     * Load groups and achievements from JSON file
     * @param path - path to JSON
     * @example <i>AchievementAPI.loadFrom(\_\_dir\_\_ + "/achievements.json")</i>
     */
    static loadFrom(path: string) {
        let content = FileTools.ReadText(path);
        if (content) {
            let parsed = JSON.parse(content);

            let groups = parsed.groups;
            if (groups) {
                for (let key in groups) {
                    AchievementAPI.registerGroup(groups[key]);
                }
            }

            let achievements = parsed.achievements;
            if (achievements) {
                for (let key in achievements) {
                    const group = achievements[key];
                    AchievementAPI.registerAll(key, group);
                }
            }

            return;
        }

        Logger.Log("Error loading file " + path, "ERROR");
    }

    //noinspection JSUnusedGlobalSymbols
    /**
     * @param groupUID - group identifier in which achievement contains
     * @param uid - achievement identifier
     * @param player - player uid
     * @returns Is the achievement unlocked?
     */
    static isUnlocked(groupUID: string, uid: string, player: number) {
        let group = this.groups[groupUID];
        if (!group) {
            throw new IllegalArgumentException(`Group with uid '${groupUID}' not found`);
        }

        let achievement = group.getChild(uid);
        if (!achievement) {
            throw new IllegalArgumentException(`Achievement with uid '${groupUID}' not found`);
        }

        return achievement.getFor(player).isUnlocked;
    }

    /**
     * Give all achievements
     */
    static giveAll(player: number) {
        for (let key in this.groups) {
            this.groups[key].giveAll(player);
        }
    }

    /**
     * @param groupUID - group identifier in which achievement contains
     * @param uid - achievement identifier
     * @param player - player uid
     * @returns Is the achievement completed?
     */
    static isCompleted(groupUID: string, uid: string, player: number): boolean {
        return this.groups[groupUID].getChild(uid).getFor(player).isCompleted;
    }

    /**
     * Give the achievement
     * @param player - player uid
     * @param groupUID - group identifier
     * @param uid - achievement identifier
     */
    static give(player: number, groupUID: string, uid: string) {
        const group = this.groups[groupUID];
        if (!group) {
            throw new IllegalArgumentException(`Group with uid '${groupUID}' not found`);
        }
        group.give(player, uid);
    }

    static resetAll() {
        for (let groupKey in this.groups) {
            const group = this.groups[groupKey];
            for (let key in group.children) {
                const child = group.getChild(key);
                child.reset();
            }
        }
    }

    static getGroup(uid: string): Nullable<AchievementGroup> {
        return this.groups[uid] || null;
    }
}

Callback.addCallback("LevelLeft", () => AchievementAPI.resetAll());
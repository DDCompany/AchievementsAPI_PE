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

        const achievement = new Achievement(group, description);
        group.addChild(achievement);
        return achievement;
    }

    /**
     * Register array of achievements
     * @param uid - group unique identifier
     * @param descriptions - descriptions array
     */
    static registerAll(uid: string, descriptions: IAchievement[]) {
        for (const description of descriptions) {
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
        const content = FileTools.ReadText(path);
        if (content) {
            const parsed = JSON.parse(content);

            const groups = parsed.groups;
            if (groups) {
                for (const key in groups) {
                    AchievementAPI.registerGroup(groups[key]);
                }
            }

            const achievements = parsed.achievements;
            if (achievements) {
                for (const key in achievements) {
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
        const group = this.groups[groupUID];
        if (!group) {
            throw new IllegalArgumentException(`Group with uid '${groupUID}' not found`);
        }

        const achievement = group.getChild(uid);
        if (!achievement) {
            throw new IllegalArgumentException(`Achievement with uid '${groupUID}' not found`);
        }

        return achievement.for(player).isUnlocked;
    }

    /**
     * Give all achievements
     */
    static giveAll(player: number) {
        for (const key in this.groups) {
            this.groups[key].giveAll(player);
        }
    }

    static revokeAll(player: number) {
        for (const groupKey in AchievementAPI.groups) {
            const group = AchievementAPI.groups[groupKey];
            for (const key in group.children) {
                const child = group.getChild(key);
                child.for(player).revoke();
            }
        }
    }

    /**
     * @param groupUID - group identifier in which achievement contains
     * @param uid - achievement identifier
     * @param player - player uid
     * @returns Is the achievement completed?
     */
    static isCompleted(groupUID: string, uid: string, player: number): boolean {
        return this.groups[groupUID].getChild(uid).for(player).isCompleted;
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
        for (const groupKey in this.groups) {
            const group = this.groups[groupKey];
            for (const key in group.children) {
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
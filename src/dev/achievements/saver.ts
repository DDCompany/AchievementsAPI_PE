type ISavedAchievement = Record<number, IFullData>;

interface IAchievementsSaver {
    data: Record<string, Record<string, ISavedAchievement>>
    _format: number
}

Saver.addSavesScope("AchievementsScope",
    function read(scope: IAchievementsSaver) {
        let groups: IAchievementsSaver["data"] = {};
        if (!scope._format) {
            Logger.Log("Old saves detected. Converting...", LOG_TAG);
            for (const groupKey in scope) {
                const group: Record<string, ISavedAchievement> = {};
                const data = scope[groupKey];

                for (const key in data) {
                    group[key] = {
                        [Player.get()]: data[key],
                    };
                }

                groups[groupKey] = group;
            }
        } else {
            groups = scope.data;
        }

        for (const groupKey in groups) {
            const group = AchievementAPI.getGroup(groupKey);
            if (!group) {
                Logger.Log(`Group with uid '${groupKey}' not found. Skipping...`, "WARNING");
                continue;
            }

            const data = groups[groupKey];
            for (const achievementKey in data) {
                const child = group.getChild(achievementKey);
                if (!child) {
                    Logger.Log(`Achievement with uid '${achievementKey}' not found. Skipping...`, "WARNING");
                    continue;
                }

                child.deserialize(data[achievementKey]);
            }
        }
    },

    function save() {
        const data: IAchievementsSaver["data"] = {};

        for (const groupKey in AchievementAPI.groups) {
            const group = AchievementAPI.groups[groupKey];
            const saved: Record<string, ISavedAchievement> = {};
            for (const childKey in group.children) {
                saved[childKey] = group.children[childKey].serialize();
            }

            data[groupKey] = saved;
        }

        return {
            data: data,
            _format: 1,
        };
    },
);
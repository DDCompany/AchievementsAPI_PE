interface ISavedAchievement {
    [key: string]: IFullData //player uid
}

interface IAchievementsSaver {
    data: Dictionary<Dictionary<ISavedAchievement>>
    _format: number
}

Saver.addSavesScope("AchievementsScope",
    function read(scope: IAchievementsSaver) {
        let groups: IAchievementsSaver["data"] = {};
        if (!scope._format) {
            Logger.Log("Old saves detected. Converting...", LOG_TAG);
            for (let groupKey in scope) {
                const group: Dictionary<ISavedAchievement> = {};
                // @ts-ignore
                const data = scope[groupKey];

                for (let key in data) {
                    group[key] = {
                        [Player.get() + ""]: data[key]
                    };
                }

                groups[groupKey] = group;
            }
        } else {
            groups = scope.data;
        }

        for (let groupKey in groups) {
            const group = AchievementAPI.getGroup(groupKey);
            if (!group) {
                Logger.Log(`Group with uid '${groupKey}' not found. Skipping...`, "WARNING");
                continue;
            }

            const data = groups[groupKey];
            for (let achievementKey in data) {
                const child = group.getChild(achievementKey);
                if (!child) {
                    Logger.Log(`Achievement with uid '${achievementKey}' not found. Skipping...`, "WARNING");
                    continue;
                }

                const achievementData = data[achievementKey];
                for (let uid in achievementData) {
                    child.setFullData(+uid, achievementData[uid]);
                }
            }
        }
    },

    function save() {
        const data: IAchievementsSaver["data"] = {};

        for (let groupKey in AchievementAPI.groups) {
            const group = AchievementAPI.groups[groupKey];
            const saved: Dictionary<ISavedAchievement> = {};

            for (let childKey in group.children) {
                const child = group.children[childKey];
                saved[childKey] = child.allData;
            }

            data[groupKey] = saved;
        }

        return {
            data: data,
            _format: 1
        };
    }
);
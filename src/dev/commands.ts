Callback.addCallback("NativeCommand", (str: string) => {
    str = str.replace("/", "");
    const parts = str.split(" ");

    if (parts[0] === "ach" || parts[0] === "achievement") {
        switch (parts[1]) {
            case "giveAll": {
                const player = parts[2] !== undefined ? getPlayerByTag(parts[2]) : Player.get();
                if (!player) {
                    Game.message("[AchievementAPI] Invalid player");
                    break;
                }

                AchievementAPI.giveAll(player);
                Game.message("[AchievementAPI] All achievements was gave");
                Game.prevent();
                return;
            }
            case "give": {
                if (parts[2] === undefined) {
                    Game.message("[AchievementAPI] Achievements group");
                    break;
                }

                const group = AchievementAPI.getGroup(parts[2]);
                if (!group) {
                    Game.message("[AchievementAPI] Achievements group");
                    break;
                }

                const player = parts[3] !== undefined ? getPlayerByTag(parts[3]) : Player.get();
                if (!player) {
                    Game.message("[AchievementAPI] Invalid player");
                    break;
                }

                group.giveAll(player);
                Game.message("[AchievementAPI] Achievements was gave!");
                Game.prevent();
                return;
            }
            case "revokeAll": {
                const player = parts[3] !== undefined ? getPlayerByTag(parts[3]) : Player.get();
                if (!player) {
                    Game.message("[AchievementAPI] Invalid player");
                    break;
                }

                for (const groupKey in AchievementAPI.groups) {
                    const group = AchievementAPI.groups[groupKey];
                    for (const key in group.children) {
                        const child = group.getChild(key);
                        child.revoke(player);
                    }
                }
                AchievementAPI.resetAll();
                Game.message("[AchievementAPI] All achievements was consumed");
                Game.prevent();
            }
        }
    }
});
Callback.addCallback("NativeCommand", (str: string) => {
    str = str.replace("/", "");
    let parts = str.split(" ");

    if (parts[0] === "ach" || parts[0] === "achievement") {
        switch (parts[1]) {
            case "giveAll":
                AchievementAPI.giveAll(Network.getClientForPlayer(Player.get()));
                Game.message("[AchievementAPI] All achievements was gave");
                Game.prevent();
                return;
            // case "give":
            //     if (!parts[2] || !AchievementAPI.giveAllForGroup(Network.getClientForPlayer(Player.get()),
            // AchievementAPI.groups[parts[2]].description)) { return; }  Game.message("[AchievementAPI] Achievements
            // was gave!"); Game.prevent(); return;
            case "consumeAll":
                AchievementAPI.resetAll();
                Game.message("[AchievementAPI] All achievements was consumed");
                Game.prevent();
        }
    }
});
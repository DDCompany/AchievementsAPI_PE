ModAPI.registerAPI("AchievementsAPI", {
    AchievementPopup: AchievementPopup,
    AchievementAPI: AchievementAPI,
    AchievementsUI: AchievementsUI,
    AchievementType: AchievementType,
    Connection: Connection,
    requireGlobal: function (command) {
        return eval(command);
    }
});
Logger.Log("AchievementsAPI shared with name AchievementsAPI", "API");
ModAPI.registerAPI("AchievementsAPI", {
    Achievement,
    AchievementAPI,
    AchievementGroup,
    AchievementsData,
    AchievementsUI,
    AchievementType,
    AchievementPopup,
    Connection,

    requireGlobal: function (command) {
        return eval(command);
    }
});
Logger.Log("AchievementsAPI shared with name AchievementsAPI", "API");
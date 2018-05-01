ModAPI.registerAPI("AchievementsAPI", {

    AchievementPopup: AchievementPopup,
    AchievementAPI: AchievementAPI,

    requireGlobal: function (command) {
        return eval(command);
    }

});
Logger.Log("AchievementsAPI shared with name AchievementsAPI", "API");
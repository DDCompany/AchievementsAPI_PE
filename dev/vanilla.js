let nether_coords = null;

Callback.addCallback("ItemUse", function (coords, item) {
    switch (item.id) {
        case 58:
            AchievementAPI.give("story", "root");
            break;
        case 325:
            if (item.data === 10) {
                AchievementAPI.give("story", "lava_bucket");
            }
            break;
        case 381:
            AchievementAPI.give("story", "follow_ender_eye");
            break;
        case 373:
            AchievementAPI.give("nether", "brew_potion");
            break;
    }
});

Callback.addCallback("DestroyBlock", function (coords, block) {
    switch (block.id) {
        case 1:
            AchievementAPI.give("story", "mine_stone");
            break;
        case 49:
            AchievementAPI.give("story", "form_obsidian");
            break;
        case 56:
            AchievementAPI.give("story", "mine_diamond");
            break;
        case 112:
            AchievementAPI.give("nether", "find_fortress");
            break;
    }
});

Callback.addCallback("NativeGuiChanged", function (screenName) {
    if (screenName === "world_loading_progress_screen - nether" && !Player.getDimension()) {
        let position = Player.getPosition();
        nether_coords = {
            x: position.x,
            y: position.y,
            z: position.z
        };
    }
});

Callback.addCallback("DimensionLoaded", function (dimensionId) {
    if (dimensionId === 1) {
        AchievementAPI.give("story", "enter_the_nether");
        AchievementAPI.give("nether", "root");
    } else if (dimensionId === 2) {
        AchievementAPI.give("story", "enter_the_end");
    } else {
        if (nether_coords) {
            if (Entity.getDistanceBetweenCoords(Player.getPosition(), nether_coords) >= 7000)
                AchievementAPI.give("nether", "fast_travel");

            nether_coords = null;
        }
    }
});

Callback.addCallback("EntityHurt", function (attacker) {
    let typeOfAttacker = Entity.getType(attacker);

    if (typeOfAttacker === 85) {
        AchievementAPI.give("nether", "return_to_sender");
    }
});

Callback.addCallback("EntityDeath", function (entity) {
    let typeOfVictim = Entity.getType(entity);

    switch (typeOfVictim) {
        case 34:
            if (Player.getDimension() === 1)
                AchievementAPI.give("nether", "kill_wither_skeleton");
            break;
        case 41:
            if (!Player.getDimension())
                AchievementAPI.give("nether", "uneasy_alliance");
            break;
        case 43:
            AchievementAPI.give("nether", "obtain_blaze_rod");
            break;
        case 53:
            AchievementAPI.give("story", "kill_dragon");
            break;
    }
});

Callback.addCallback("EntityAdded", function (entity) {
    let type = Entity.getType(entity);
    if (type === 52)
        AchievementAPI.give("nether", "summon_wither");
    else if(type === 64) {
        let item = Entity.getDroppedItem(entity);
        if(item.id === 122)
            AchievementAPI.give("nether", "summon_wither");
    }
});

Recipes.deleteRecipe({id: 274, count: 1, data: 0});
Recipes.addShaped({id: 274, count: 1, data: 0}, [
    "xxx",
    " a ",
    " a "
], ['x', 4, 0, 'a', 280, 0], function () {
    AchievementAPI.give("story", "upgrade_tools");
});

Recipes.deleteRecipe({id: 307, count: 1, data: 0});
Recipes.addShaped({id: 307, count: 1, data: 0}, [
    "x x",
    "xxx",
    "xxx"
], ['x', 265, 0], function () {
    AchievementAPI.give("story", "obtain_armor");
});

Recipes.deleteRecipe({id: 257, count: 1, data: 0});
Recipes.addShaped({id: 257, count: 1, data: 0}, [
    "xxx",
    " a ",
    " a "
], ['x', 265, 0, 'a', 280, 0], function () {
    AchievementAPI.give("story", "iron_tools");
});

Recipes.deleteRecipe({id: 311, count: 1, data: 0});
Recipes.addShaped({id: 311, count: 1, data: 0}, [
    "x x",
    "xxx",
    "xxx"
], ['x', 264, 0], function () {
    AchievementAPI.give("story", "shiny_gear");
});






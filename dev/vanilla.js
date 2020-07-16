AchievementAPI.loadFrom(__dir__ + "json/vanilla.json");

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

Callback.addCallback("DimensionLoaded", function (dimensionId) {
    if (dimensionId === 1) {
        AchievementAPI.give("story", "enter_the_nether");
        AchievementAPI.give("nether", "root");
    } else if (dimensionId === 2) {
        AchievementAPI.give("story", "enter_the_end");
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
    else if (type === 64) {
        let item = Entity.getDroppedItem(entity);
        if (item.id === 122)
            AchievementAPI.give("nether", "summon_wither");
    }
});

Callback.addCallback("VanillaWorkbenchCraft", function (result) {
    switch (result.id) {
        case VanillaItemID.stone_pickaxe:
            AchievementAPI.give("story", "upgrade_tools");
            break;
        case VanillaItemID.iron_chestplate:
            AchievementAPI.give("story", "obtain_armor");
            break;
        case VanillaItemID.iron_pickaxe:
            AchievementAPI.give("story", "iron_tools");
            break;
        case VanillaItemID.diamond_chestplate:
            AchievementAPI.give("story", "shiny_gear");
            break;
    }
});
AchievementAPI.loadFrom(__dir__ + "achievements/story.json");
AchievementAPI.loadFrom(__dir__ + "achievements/nether.json");

Callback.addCallback("ItemUse", function (coords, item) {
    switch (item.id) {
        case VanillaBlockID.crafting_table:
            AchievementAPI.give("story", "root");
            break;
        case VanillaItemID.bucket:
            if (item.data === 10) { //lava_bucket
                AchievementAPI.give("story", "lava_bucket");
            }
            break;
        case VanillaItemID.ender_eye:
            AchievementAPI.give("story", "follow_ender_eye");
            break;
        case VanillaItemID.potion:
            AchievementAPI.give("nether", "brew_potion");
            break;
    }
});

Callback.addCallback("DestroyBlock", function (coords, block) {
    switch (block.id) {
        case VanillaBlockID.stone:
            AchievementAPI.give("story", "mine_stone");
            break;
        case VanillaBlockID.obsidian:
            AchievementAPI.give("story", "form_obsidian");
            break;
        case VanillaBlockID.diamond_ore:
            AchievementAPI.give("story", "mine_diamond");
            break;
        case VanillaBlockID.nether_brick:
            AchievementAPI.give("nether", "find_fortress");
            break;
    }
});

Callback.addCallback("DimensionLoaded", function (dimensionId) {
    if (dimensionId === DimensionType.NETHER) {
        AchievementAPI.give("story", "enter_the_nether");
        AchievementAPI.give("nether", "root");
    } else if (dimensionId === DimensionType.END) {
        AchievementAPI.give("story", "enter_the_end");
    }
});

Callback.addCallback("EntityHurt", function (attacker) {
    let typeOfAttacker = Entity.getType(attacker);

    if (typeOfAttacker === EntityType.FIREBALL) {
        AchievementAPI.give("nether", "return_to_sender");
    }
});

Callback.addCallback("EntityDeath", function (entity) {
    let typeOfVictim = Entity.getType(entity);

    switch (typeOfVictim) {
        case EntityType.WHITHER_SKELETON:
            if (Player.getDimension() === DimensionType.NETHER)
                AchievementAPI.give("nether", "kill_wither_skeleton");
            break;
        case EntityType.GHAST:
            if (Player.getDimension() === DimensionType.NORMAL)
                AchievementAPI.give("nether", "uneasy_alliance");
            break;
        case EntityType.BLAZE:
            AchievementAPI.give("nether", "obtain_blaze_rod");
            break;
        case EntityType.ENDER_DRAGON:
            AchievementAPI.give("story", "kill_dragon");
            break;
    }
});

Callback.addCallback("EntityAdded", function (entity) {
    let type = Entity.getType(entity);
    if (type === EntityType.WHITHER)
        AchievementAPI.give("nether", "summon_wither");
    else if (type === EntityType.ITEM) {
        let item = Entity.getDroppedItem(entity);
        if (item.id === VanillaBlockID.dragon_egg)
            AchievementAPI.give("nether", "summon_wither");
    }
});

Callback.addCallback("VanillaWorkbenchCraft", function (result) {
    switch (result.id) {
        case VanillaItemID.stone_pickaxe:
            AchievementAPI.give("story", "upgrade_tools");
            break;
        case VanillaItemID.iron_helmet:
        case VanillaItemID.iron_chestplate:
        case VanillaItemID.iron_leggings:
        case VanillaItemID.iron_boots:
            AchievementAPI.give("story", "obtain_armor");
            break;
        case VanillaItemID.diamond_helmet:
        case VanillaItemID.diamond_chestplate:
        case VanillaItemID.diamond_leggings:
        case VanillaItemID.diamond_boots:
            AchievementAPI.give("story", "shiny_gear");
            break;
        case VanillaItemID.iron_pickaxe:
            AchievementAPI.give("story", "iron_tools");
            break;
    }
});
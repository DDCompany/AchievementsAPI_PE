AchievementAPI.loadFrom(__dir__ + "achievements/story.json");
AchievementAPI.loadFrom(__dir__ + "achievements/nether.json");

Callback.addCallback("ItemUse", function (coords, item, block, isExternal, player) {
    switch (item.id) {
        case VanillaBlockID.crafting_table:
            AchievementAPI.give(player, "story", "root");
            break;
        case VanillaItemID.bucket:
            if (item.data === 10) { //lava_bucket
                AchievementAPI.give(player, "story", "lava_bucket");
            }
            break;
        case VanillaItemID.ender_eye:
            AchievementAPI.give(player, "story", "follow_ender_eye");
            break;
        case VanillaItemID.potion:
            AchievementAPI.give(player, "nether", "brew_potion");
            break;
    }
});

Callback.addCallback("DestroyBlock", function (coords, block, player) {
    switch (block.id) {
        case VanillaBlockID.stone:
            AchievementAPI.give(player, "story", "mine_stone");
            break;
        case VanillaBlockID.obsidian:
            AchievementAPI.give(player, "story", "form_obsidian");
            break;
        case VanillaBlockID.diamond_ore:
            AchievementAPI.give(player, "story", "mine_diamond");
            break;
        case VanillaBlockID.nether_brick:
            AchievementAPI.give(player, "nether", "find_fortress");
            break;
    }
});

Callback.addCallback("PlayerChangedDimension", function (player, dimension) {
    if (dimension === DimensionType.NETHER) {
        AchievementAPI.give(player, "story", "enter_the_nether");
        AchievementAPI.give(player, "nether", "root");
    } else if (dimension === DimensionType.END) {
        AchievementAPI.give(player, "story", "enter_the_end");
    }
});

Callback.addCallback("EntityHurt", function (attacker, victim) {
    const typeOfAttacker = Entity.getType(attacker);
    if (typeOfAttacker !== 1) {
        return;
    }

    const typeOfVictim = Entity.getType(victim);
    if (typeOfVictim === EntityType.FIREBALL) {
        AchievementAPI.give(attacker, "nether", "return_to_sender");
    }
});

Callback.addCallback("EntityDeath", function (entity, attacker) {
    const typeOfAttacker = Entity.getType(attacker);
    if (typeOfAttacker !== 1) {
        return;
    }

    const typeOfVictim = Entity.getType(entity);
    switch (typeOfVictim) {
        case EntityType.WHITHER_SKELETON:
            if (Player.getDimension() === DimensionType.NETHER) {
                AchievementAPI.give(attacker, "nether", "kill_wither_skeleton");
            }
            break;
        case EntityType.GHAST:
            if (Player.getDimension() === DimensionType.NORMAL) {
                AchievementAPI.give(attacker, "nether", "uneasy_alliance");
            }
            break;
        case EntityType.BLAZE:
            AchievementAPI.give(attacker, "nether", "obtain_blaze_rod");
            break;
        case EntityType.ENDER_DRAGON:
            AchievementAPI.give(attacker, "story", "kill_dragon");
            break;
    }
});

Callback.addCallback("EntityAdded", function (entity) {
    if (Entity.getType(entity) === EntityType.WHITHER) {
        const source = BlockSource.getDefaultForActor(entity);
        const pos = Entity.getPosition(entity);
        const range = 40;
        source.fetchEntitiesInAABB(pos.x - range, pos.y - range, pos.z - range, pos.x + range, pos.y + range,
            pos.z + range, EntityType.PLAYER, false)
            .forEach(player =>
                AchievementAPI.give(player, "nether", "summon_wither"));
    }
});

Callback.addCallback("VanillaWorkbenchCraft", function (result, container, player) {
    switch (result.id) {
        case VanillaItemID.stone_pickaxe:
            AchievementAPI.give(player, "story", "upgrade_tools");
            break;
        case VanillaItemID.iron_helmet:
        case VanillaItemID.iron_chestplate:
        case VanillaItemID.iron_leggings:
        case VanillaItemID.iron_boots:
            AchievementAPI.give(player, "story", "obtain_armor");
            break;
        case VanillaItemID.diamond_helmet:
        case VanillaItemID.diamond_chestplate:
        case VanillaItemID.diamond_leggings:
        case VanillaItemID.diamond_boots:
            AchievementAPI.give(player, "story", "shiny_gear");
            break;
        case VanillaItemID.iron_pickaxe:
            AchievementAPI.give(player, "story", "iron_tools");
            break;
    }
});
/*
        _        _     _                                     _          _    ____ ___
       / \   ___| |__ (_) _____   _____ _ __ ___   ___ _ __ | |_ ___   / \  |  _ \_ _|
      / _ \ / __| '_ \| |/ _ \ \ / / _ \ '_ ` _ \ / _ \ '_ \| __/ __| / _ \ | |_) | |
     / ___ \ (__| | | | |  __/\ V /  __/ | | | | |  __/ | | | |_\__ \/ ___ \|  __/| |
    /_/   \_\___|_| |_|_|\___| \_/ \___|_| |_| |_|\___|_| |_|\__|___/_/   \_\_|  |___|

    Docs: https://wiki.mineprogramming.org/index.php/InnerCore/Mods/AchievementsAPI
    Github Repository: https://github.com/DDCompany/AchievementsAPI_PE
    Issues Tracker: https://github.com/DDCompany/AchievementsAPI_PE/issues

    Terms of use:
     - Forbidden to distribute the mod on third-party sources
       without links to the official group (https://vk.com/forestry_pe)
     - Forbidden to change the code of this mod
     - Forbidden to copy the code to other mods or libraries
     - Allowed to use the mod in any packs
     - Using the mod you automatically agree to the conditions described above

    + Textures belongs to Mojang
    © DDCompany (https://vk.com/forestry_pe)
 */

const DimensionType = Native.Dimension;
const EntityType = Native.EntityType;
const ChatColor = Native.Color;
const simulateBackPressed = ModAPI.requireGlobal("MCSystem.simulateBackPressed");
const IllegalArgumentException = java.lang.IllegalArgumentException;
const LOG_TAG = "ACHIEVEMENTS-API";

function getPlayerByTag(tag: string): Nullable<number> {
    const clients = Network.getServer().getConnectedClients();
    for (let i = 0; i < clients.size(); i++) {
        const client = clients.get(i);
        if (Entity.getNameTag(client.getPlayerUid()) === tag) {
            return client.getPlayerUid();
        }
    }

    return null;
}

function getPlayerName() {
    return Entity.getNameTag(Player.get());
}
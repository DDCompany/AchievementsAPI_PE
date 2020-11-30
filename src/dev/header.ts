/*
        _        _     _                                     _          _    ____ ___
       / \   ___| |__ (_) _____   _____ _ __ ___   ___ _ __ | |_ ___   / \  |  _ \_ _|
      / _ \ / __| '_ \| |/ _ \ \ / / _ \ '_ ` _ \ / _ \ '_ \| __/ __| / _ \ | |_) | |
     / ___ \ (__| | | | |  __/\ V /  __/ | | | | |  __/ | | | |_\__ \/ ___ \|  __/| |
    /_/   \_\___|_| |_|_|\___| \_/ \___|_| |_| |_|\___|_| |_|\__|___/_/   \_\_|  |___|

    AchievementsAPI mod

    Terms of Use:
      - Forbidden to distribute the mod on third-party sources
        without link to the official community (https://vk.com/forestry_pe)
      - Forbidden to change the mod code
      - Forbidden to copy the code to other mods or libraries
      - Allowed to use the mod in any packs
      - Using the mod you automatically agree with the described
        above conditions

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

const NetworkThreadMarker = java.lang.Class.forName("com.zhekasmirnov.apparatus.multiplayer.NetworkThreadMarker", true,
    UI.getContext().getClassLoader());
const nativeAssertServerThread = NetworkThreadMarker.getMethod("assertServerThread", null);

function assertServerSide() {
    nativeAssertServerThread.invoke(null, null);
}
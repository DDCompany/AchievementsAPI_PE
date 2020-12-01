interface IHandleCmdPacket {
    type: "giveAll" | "give" | "revokeAll",
    player: string,
    group?: string
}

Callback.addCallback("NativeCommand", (cmd: string) => {
    const parts = cmd.substr(1).split(" ");
    if (parts[0] !== "ach" && parts[0] !== "achievement") {
        return;
    }

    switch (parts[1]) {
        case "giveAll":
            Network.sendToServer("achievements_api.handle_command",
                {type: "giveAll", player: parts[2] ? parts[2] : getPlayerName()});
            break;
        case "give":
            Network.sendToServer("achievements_api.handle_command",
                {type: "give", player: parts[3] ? parts[3] : getPlayerName(), group: parts[2]});
            break;
        case "revokeAll":
            Network.sendToServer("achievements_api.handle_command",
                {type: "revokeAll", player: parts[2] ? parts[2] : getPlayerName()});
            break;
        default:
            return;
    }

    Game.prevent();
});

Network.addServerPacket<IHandleCmdPacket>("achievements_api.handle_command", (client, data) => {
    if (client.getPlayerUid() != Player.get()) { //require != because !== return false for same values
        client.sendMessage(`${ChatColor.RED}Commands allowed only on host player`);
        return;
    }

    if (!data.player) {
        client.sendMessage(`${ChatColor.RED}Player not found`);
    }

    const player = getPlayerByTag(data.player);
    if (!player) {
        client.sendMessage(`${ChatColor.RED}Player with nickname "${data.player}" not found`);
        return;
    }

    switch (data.type) {
        case "giveAll": {
            AchievementAPI.giveAll(player);
            client.sendMessage("Achievements given");
            return;
        }
        case "give": {
            if (!data.group) {
                client.sendMessage(`${ChatColor.RED}Invalid group uid`);
                break;
            }

            const group = AchievementAPI.getGroup(data.group);
            if (!group) {
                client.sendMessage(`${ChatColor.RED}Group with name "${data.group}" not found`);
                break;
            }

            group.giveAll(player);
            client.sendMessage("Achievements given");
            return;
        }
        case "revokeAll": {
            for (const groupKey in AchievementAPI.groups) {
                const group = AchievementAPI.groups[groupKey];
                for (const key in group.children) {
                    const child = group.getChild(key);
                    child.for(player).revoke();
                }
            }
            client.sendMessage("Achievements revoked");
            return;
        }
    }
});
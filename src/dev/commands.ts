Callback.addCallback("NativeCommand", (cmd: string) => {
    if (Network.inRemoteWorld()) {
        Game.message(`${ChatColor.RED}[AchievementAPI] Commands allowed only on host player`);
    } else {
        Network.sendToServer("achievements_api.handle_command", cmd);
    }
    Game.prevent();
});

Network.addServerPacket("achievements_api.handle_command", (client, cmd: string) => {
    if (client.getPlayerUid() != Player.get()) { //require != because !== return false for same values
        return;
    }

    const parts = cmd.substr(1).split(" ");
    if (parts[0] !== "ach" && parts[0] !== "achievement") {
        return;
    }

    switch (parts[1]) {
        case "giveAll": {
            const player = parts[2] ? getPlayerByTag(parts[2]) : Player.get();
            if (!player) {
                client.sendMessage(`${ChatColor.RED}Player with nickname "${parts[2]}" not found`);
                break;
            }

            AchievementAPI.giveAll(player);
            client.sendMessage(`Achievements given to ${parts[2]}`);
            return;
        }
        case "give": {
            const groupUID = parts[2];
            if (!groupUID) {
                client.sendMessage(`${ChatColor.RED}Invalid group uid`);
                break;
            }

            const group = AchievementAPI.getGroup(groupUID);
            if (!group) {
                client.sendMessage(`${ChatColor.RED}Group with name "${groupUID}" not found`);
                break;
            }

            const player = parts[3] ? getPlayerByTag(parts[3]) : Player.get();
            if (!player) {
                client.sendMessage(`${ChatColor.RED}Player with nickname "${parts[2]}" not found`);
                break;
            }

            group.giveAll(player);
            client.sendMessage(`Achievements given to ${parts[3]}`);
            return;
        }
        case "revokeAll": {
            const player = parts[2] ? getPlayerByTag(parts[2]) : Player.get();
            if (!player) {
                client.sendMessage(`${ChatColor.RED}Player with nickname "${parts[2]}" not found`);
                break;
            }

            for (const groupKey in AchievementAPI.groups) {
                const group = AchievementAPI.groups[groupKey];
                for (const key in group.children) {
                    const child = group.getChild(key);
                    child.revoke(player);
                }
            }
            AchievementAPI.resetAll();
            client.sendMessage(`Achievements revoked from ${parts[2]}`);
        }
    }
});
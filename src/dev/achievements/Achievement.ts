interface IFullData {
    completed: boolean
    progress: number
    custom: Dictionary<any>
}

class Achievement {
    private _dataFor: { [key: number]: IFullData } = {};
    private readonly _parent: Nullable<Achievement>;
    private readonly _description: IConvertedAchievement;

    constructor(private _group: AchievementGroup, _description: IAchievement) {
        const parent = _description.parent;
        if (parent) {
            const parts = parent.split(":");
            this._parent =
                this.findParent(parts.length > 1 ? parts[0] : undefined, parts.length > 1 ? parts[1] : parts[0]);
        }

        if (typeof _description.icon === "number") {
            _description.icon = {
                id: _description.icon
            };
        }

        _description.connection = _description.connection || Connection.HORIZONTAL;
        this._description = _description as IConvertedAchievement;
    }

    give(player: number) {
        const client = Network.getClientForPlayer(player);
        if (this.isCompleted(client.getPlayerUid())) {
            return;
        }

        if (this._parent && !this._parent.isCompleted(client.getPlayerUid())) {
            return;
        }

        const data = this.getData(player);
        if (this._description.progressMax && ++data.progress < this._description.progressMax) {
            return;
        }

        if (this._description.showPopup !== false) {
            let item = this.icon;
            let title;
            let color;

            switch (this._description.type) {
                case "challenge":
                    title = Translation.translate("achievements_api.challenge_complete");
                    color = android.graphics.Color.MAGENTA;
                    break;
                case "goal":
                    title = Translation.translate("achievements_api.goal_complete");
                    color = android.graphics.Color.YELLOW;
                    break;
                default:
                    title = Translation.translate("achievements_api.complete");
                    color = android.graphics.Color.YELLOW;
            }

            AchievementPopup.showFor(client, {
                title: title,
                color: color,
                description: Translation.translate(this._description.name) || "",
                item: {
                    id: item.id || 1,
                    data: item.data || 0,
                    count: 1
                }
            });
        }

        this.setCompleted(player, true);
        Callback.invokeCallback("onAchieve", this._group.description, this.description);
        Callback.invokeCallback("onAchievementCompleted", this);
    }

    reset() {
        this._dataFor = {};
    }

    setCompleted(player: number, value: boolean) {
        this.getFullData(player).completed = value;
    }

    getData(player: number) {
        return this.getFullData(player).custom;
    }

    getFullData(player: number) {
        let data = this._dataFor[player];
        if (!data) {
            data = {
                completed: false,
                progress: 0,
                custom: {}
            };
            this._dataFor[player] = data;
        }

        return data;
    }

    setFullData(player: number, data: IFullData) {
        this._dataFor[player] = data;
    }

    /**
     * @return Is the achievement completed?
     */
    isCompleted(player: number) {
        return this.getFullData(player).completed;
    }

    /**
     * @return Is the achievement unlocked?
     */
    isUnlocked(player: number) {
        return this._parent ? this._parent.isCompleted(player) : true;
    }

    getTexture(player: number) {
        let type;

        if (this.isCompleted(player)) {
            type = "completed";
        } else if (this.isUnlocked(player)) {
            type = "unlocked";
        } else {
            type = "locked";
        }

        return "achievement_bg." + (this._description.type || "default") + "_" + type;
    }

    progress(player: number): number {
        return this.getData(player).progress;
    }

    private findParent(groupUID: Nullable<string>, uid: string) {
        let child: Nullable<Achievement> = null;
        if (!groupUID || groupUID == this.group.uid) {
            child = this.group.getChild(uid);
        } else {
            const otherGroup = AchievementAPI.groups[groupUID];
            if (otherGroup) {
                child = otherGroup.getChild(uid);
            } else {
                throw new IllegalArgumentException(`Parent not found: group uid is invalid (${groupUID}:${uid})`);
            }
        }

        if (child) {
            return child;
        } else {
            throw new IllegalArgumentException(`Parent not found: achievement uid is invalid (${groupUID}:${uid})`);
        }
    }

    get allData() {
        return this._dataFor;
    }

    get strongDependence() {
        return this._description.hidden;
    }

    get parent() {
        return this._parent;
    }

    get uid(): string {
        return this._description.uid;
    }

    get description() {
        return this._description;
    }

    get icon() {
        return this._description.icon;
    }

    get group() {
        return this._group;
    }
}
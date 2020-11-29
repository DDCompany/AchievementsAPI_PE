class AchievementsData {
    private readonly _fullData: IFullData;

    constructor(private player: number,
                private _achievement: Achievement,
                data: Nullable<IFullData>) {

        this._fullData = data ?? {
            progress: 0,
            custom: {},
            completed: false,
        };
    }

    get isCompleted() {
        return this._fullData.completed;
    }

    set isCompleted(value: boolean) {
        this._fullData.completed = value;
    }

    get isUnlocked() {
        return this._achievement.parent?.for(this.player)?.isCompleted ?? true;
    }

    get texture() {
        let type;

        if (this.isCompleted) {
            type = "completed";
        } else if (this.isUnlocked) {
            type = "unlocked";
        } else {
            type = "locked";
        }

        return "achievements_api.textures." + (this._achievement.prototype.type || "default") + "_" + type;
    }

    get progress(): number {
        return this._fullData.progress;
    }

    get achievement(): Achievement {
        return this._achievement;
    }

    get fullData(): IFullData {
        return this._fullData;
    }

    data<T>() {
        return this._fullData.custom as T;
    }

    revoke() {
        this._fullData.completed = false;
    }

    give() {
        if (this.isCompleted) {
            return;
        }

        const parent = this._achievement.parent;
        if (parent && !parent.for(this.player).isCompleted) {
            return;
        }

        const description = this._achievement.prototype;
        if (description.progressMax && ++this._fullData.progress < description.progressMax) {
            return;
        }

        if (description.showPopup !== false) {
            const item = description.icon;
            let title;
            let color;

            switch (description.type) {
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

            AchievementPopup.showFor(Network.getClientForPlayer(this.player), {
                title: title,
                color: color,
                description: Translation.translate(description.name) || "",
                item: {
                    id: item.id || 1,
                    data: item.data || 0,
                    count: 1,
                },
            });
        }

        if (description.announce ?? true) {
            Network.sendServerMessage(`${Entity.getNameTag(this.player)} ${Translation.translate(
                "achievements_api.made")} ${Native.Color.GREEN}[${this.achievement.name}]`);
        }

        this.isCompleted = true;
        Callback.invokeCallback("onAchievementCompleted", this);
    }

    serialize() {
        return this._fullData;
    }
}
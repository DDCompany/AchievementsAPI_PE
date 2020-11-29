interface IFullData {
    completed: boolean
    progress: number
    custom: Record<string, Record<string, unknown>>
}

class Achievement {
    private _dataFor: Record<number, AchievementsData> = {};
    private readonly _parent: Nullable<Achievement>;
    private readonly _prototype: IConvertedAchievement;

    constructor(private _group: AchievementGroup,
                _description: IAchievement) {

        const parent = _description.parent;
        if (parent) {
            const parts = parent.split(":");
            this._parent =
                this.findParent(parts.length > 1 ? parts[0] : undefined, parts.length > 1 ? parts[1] : parts[0]);
        }

        if (typeof _description.icon === "number") {
            _description.icon = {
                id: _description.icon,
            };
        }

        _description.connection = _description.connection || Connection.HORIZONTAL;
        this._prototype = _description as IConvertedAchievement;
    }

    get allData() {
        return this._dataFor;
    }

    get hidden() {
        return this._prototype.hidden;
    }

    get parent() {
        return this._parent;
    }

    get uid(): string {
        return this._prototype.uid;
    }

    get prototype() {
        return this._prototype;
    }

    get icon() {
        return this._prototype.icon;
    }

    get group() {
        return this._group;
    }

    get name() {
        return Translation.translate(this._prototype.name);
    }

    get description() {
        return Translation.translate(this._prototype.description);
    }

    for(player: number) {
        const data = this._dataFor[player];
        if (!data) {
            return this._dataFor[player]
                = new AchievementsData(player, this, null);
        }

        return data;
    }

    reset() {
        this._dataFor = {};
    }

    deserialize(data: ISavedAchievement) {
        this.reset();
        for (const key in data) {
            this._dataFor[key] = new AchievementsData(+key, this, data[key]);
        }
    }

    serialize() {
        const json = {};
        for (const key in this._dataFor) {
            json[key] = this._dataFor[key].serialize();
        }
        return json;
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
}
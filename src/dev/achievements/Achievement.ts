interface IFullData {
    completed: boolean
    progress: number
    custom: Record<string, any>
}

class Achievement {
    private _dataFor: Record<number, AchievementsData> = {};
    private readonly _parent: Nullable<Achievement>;
    private readonly _description: IConvertedAchievement;

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
                id: _description.icon
            };
        }

        _description.connection = _description.connection || Connection.HORIZONTAL;
        this._description = _description as IConvertedAchievement;
    }

    getFor(player: number) {
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

    deserialize(data: ISavedAchievement) {
        this.reset();
        for (let key in data) {
            this._dataFor[key] = new AchievementsData(+key, this, data[key]);
        }
    }

    serialize() {
        const json = {};
        for (let key in this._dataFor) {
            json[key] = this._dataFor[key].serialize();
        }
        return json;
    }
}
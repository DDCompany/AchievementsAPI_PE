class AchievementGroup {
    private readonly _children: Dictionary<Achievement> = {};

    constructor(private _description: IAchievementGroup) {
        if (!_description.uid) {
            throw new IllegalArgumentException("Invalid uid");
        }

        if (typeof _description.icon === "number") {
            _description.icon = {
                id: _description.icon
            };
        }
    }

    give(player: number, uid: string) {
        const achievement = this.getChild(uid);
        if (!achievement) {
            throw new IllegalArgumentException("Invalid achievement uid");
        }
        achievement.give(player);
    }

    addChild(child: Achievement) {
        if (this._children[child.uid]) {
            throw new IllegalArgumentException(`Achievement with uid '${child.uid}' already registered`);
        }

        this._children[child.uid] = child;
    }

    /**
     * Give all achievements of the group
     */
    giveAll(player: number) {
        for (let key in this._children) {
            this._children[key].give(player);
        }
    }

    getChild(uid: string) {
        return this._children[uid];
    }

    get uid() {
        return this._description.uid;
    }

    get children() {
        return this._children;
    }

    get description() {
        return this._description;
    }

    get width() {
        return this._description.width;
    }

    get height() {
        return this._description.height;
    }

    get name() {
        return this._description.name;
    }

    get icon() {
        return this._description.icon as IItemIcon;
    }

    get nodeSize() {
        return this._description.size;
    }

    get backgroundTexture() {
        return this._description.background;
    }
}
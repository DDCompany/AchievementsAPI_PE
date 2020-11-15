class AchievementGroup {
    private readonly _children: Record<string, Achievement> = {};

    constructor(private _prototype: IAchievementGroup) {
        if (!_prototype.uid) {
            throw new IllegalArgumentException("Invalid uid");
        }

        if (typeof _prototype.icon === "number") {
            _prototype.icon = {
                id: _prototype.icon,
            };
        }
    }

    get uid() {
        return this._prototype.uid;
    }

    get children() {
        return this._children;
    }

    get prototype() {
        return this._prototype;
    }

    get width() {
        return this._prototype.width;
    }

    get height() {
        return this._prototype.height;
    }

    get name() {
        return this._prototype.name;
    }

    get icon() {
        return this._prototype.icon as IItemIcon;
    }

    get nodeSize() {
        return this._prototype.size;
    }

    get backgroundTexture() {
        return this._prototype.background;
    }

    give(player: number, uid: string) {
        const achievement = this.getChild(uid);
        if (!achievement) {
            throw new IllegalArgumentException("Invalid achievement uid");
        }
        achievement.getFor(player).give();
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
            this._children[key].getFor(player).give();
        }
    }

    getChild(uid: string) {
        return this._children[uid];
    }
}
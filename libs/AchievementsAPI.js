/*
        _        _     _                                     _          _    ____ ___
       / \   ___| |__ (_) _____   _____ _ __ ___   ___ _ __ | |_ ___   / \  |  _ \_ _|
      / _ \ / __| '_ \| |/ _ \ \ / / _ \ '_ ` _ \ / _ \ '_ \| __/ __| / _ \ | |_) | |
     / ___ \ (__| | | | |  __/\ V /  __/ | | | | |  __/ | | | |_\__ \/ ___ \|  __/| |
    /_/   \_\___|_| |_|_|\___| \_/ \___|_| |_| |_|\___|_| |_|\__|___/_/   \_\_|  |___|

    AchievementsAPI library
     
    Условия использования:
      - Запрещено распространение библиотеки на сторонних источниках
        без ссылки на официальное сообщество(https://vk.com/forestry_pe)
      - Запрещено изменение кода библиотеки
      - Запрещено явное копирование кода в другие библиотеки или моды
      - Используя библиотеку вы автоматически соглашаетесь с описанными
        выше условиями
             
    ©DDCompany (https://vk.com/forestry_pe)
*/
LIBRARY({
    name: "AchievementsAPI",
    version: 1,
    shared: true,
    api: "CoreEngine"
});
var IllegalArgumentException = java.lang.IllegalArgumentException;
Translation.addTranslation("message.achievementApi.achievement_complete", {
    en: "Achievement Made!",
    ru: "Достижение выполнено"
});
Translation.addTranslation("message.achievementApi.challenge_complete", {
    en: "Challenge Made!",
    ru: "Испытание выполнено"
});
Translation.addTranslation("message.achievementApi.goal_complete", {
    en: "Goal Completed",
    ru: "Цель выполнена"
});
Translation.addTranslation("achievementApi.achievements", {en: "Advancements", ru: "Достижения"});
Translation.addTranslation("achievementApi.nothing", {
    ru: "Здесь ничего нет :("
});
/**
 * Class for managing popups on the screen
 */
var AchievementPopup = /** @class */ (function () {
    function AchievementPopup() {
    }

    /**
     * Initialize the window
     */
    AchievementPopup.init = function () {
        this.popupUI.setAsGameOverlay(true);
    };
    /**
     * Display notification
     * @param popup - popup for display
     */
    AchievementPopup.show = function (popup) {
        this.popupQueue.push(popup);
    };
    /**
     * @return last popup in queue
     */
    AchievementPopup.popQueue = function () {
        return this.popupQueue.pop();
    };
    /**
     * The default color of popup title
     */
    AchievementPopup.DEFAULT_TITLE_COLOR = android.graphics.Color.YELLOW;
    /**
     * The default time in ticks that popup will be on the screen
     */
    AchievementPopup.DEFAULT_DELAY = 80;
    /**
     * Queue of popups to be displayed. Use <i>AchievementPopup.popQueue</i> to get last popup in the queue and
     * <i>AchievementPopup</i> to add new one
     */
    AchievementPopup.popupQueue = [];
    /**
     * Container of popup window
     */
    AchievementPopup.container = new UI.Container();
    /**
     * Popup window
     */
    AchievementPopup.popupUI = new UI.Window({
        location: {
            x: 700,
            y: 0,
            width: 300,
            height: 60
        },
        drawing: [
            { type: "color", color: android.graphics.Color.rgb(33, 33, 33) },
            { type: "frame", x: 0, y: 0, width: 1000, height: 200, bitmap: "frame_achievement", scale: 5 }
        ],
        elements: {
            "title": {
                type: "text",
                text: "",
                x: 190,
                y: 30,
                font: { color: android.graphics.Color.YELLOW, size: 50 }
            },
            "description": {
                type: "text",
                text: "",
                x: 190,
                y: 100,
                font: { color: android.graphics.Color.WHITE, size: 50 }
            },
            "slot": {
                type: "slot",
                x: 5,
                y: 5,
                size: 190,
                bitmap: "_default_slot_empty",
                isTransparentBackground: true,
                visual: true
            }
        }
    });
    /**
     * Time that popup showed on the screen. If the field more than 0, each tick decreased until becomes 0, after which
     * popup disappear
     */
    AchievementPopup.delay = 0;
    return AchievementPopup;
}());
AchievementPopup.init();
Callback.addCallback("tick", function () {
    var _a, _b, _c;
    if (!AchievementPopup.delay) {
        var popup = AchievementPopup.popQueue();
        if (popup) {
            var content = AchievementPopup.popupUI.getContent();
            var container = AchievementPopup.container;
            var elements = content.elements;
            var item = popup.item;
            var slot = container.getSlot("slot");
            elements.title.text = popup.title;
            elements.title.font.color = popup.color || AchievementPopup.DEFAULT_TITLE_COLOR;
            elements.description.text = popup.description;
            slot.id = (_a = item === null || item === void 0 ? void 0 : item.id) !== null && _a !== void 0 ? _a : 0;
            slot.data = (_b = item === null || item === void 0 ? void 0 : item.data) !== null && _b !== void 0 ? _b : 0;
            slot.count = (_c = item === null || item === void 0 ? void 0 : item.count) !== null && _c !== void 0 ? _c : 1;
            AchievementPopup.delay = popup.delay || AchievementPopup.DEFAULT_DELAY;
            container.openAs(AchievementPopup.popupUI);
        }
        return;
    }
    if (--AchievementPopup.delay <= 0) {
        AchievementPopup.delay = 0;
        AchievementPopup.container.close();
    }
});
EXPORT("AchievementPopup", AchievementPopup);
var AchievementType;
(function (AchievementType) {
    AchievementType["default"] = "default";
    AchievementType["challenge"] = "challenge";
    AchievementType["goal"] = "goal";
})(AchievementType || (AchievementType = {}));
var AchievementGroup = /** @class */ (function () {
    function AchievementGroup(description) {
        this.description = description;
        this.children = {};
        if (!description.unique) {
            throw new IllegalArgumentException("Invalid uid");
        }
    }
    AchievementGroup.prototype.give = function (uid) {
        var achievement = this.getChild(uid);
        if (!achievement) {
            throw new IllegalArgumentException("Invalid achievement uid");
        }
        achievement.give();
    };
    /**
     * Give all achievements of the group
     */
    AchievementGroup.prototype.giveAll = function () {
        for (var key in this.children) {
            this.children[key].give();
        }
    };
    AchievementGroup.prototype.getUid = function () {
        return this.description.unique;
    };
    AchievementGroup.prototype.addChildren = function (child) {
        if (this.children[child.getUid()]) {
            throw new IllegalArgumentException("Achievement with uid '" + child.getUid() + "' already registered");
        }
        this.children[child.getUid()] = child;
    };
    AchievementGroup.prototype.getChild = function (uid) {
        return this.children[uid];
    };
    AchievementGroup.prototype.getChildren = function () {
        return this.children;
    };
    AchievementGroup.prototype.getDescription = function () {
        return this.description;
    };
    AchievementGroup.prototype.getWidth = function () {
        return this.description.width;
    };
    AchievementGroup.prototype.getHeight = function () {
        return this.description.height;
    };
    AchievementGroup.prototype.getName = function () {
        return this.description.name;
    };
    AchievementGroup.prototype.getIcon = function () {
        return this.description.icon;
    };
    AchievementGroup.prototype.getBgTextureName = function () {
        return this.description.bgTexture;
    };
    AchievementGroup.prototype.getAchievementSize = function () {
        return this.description.size;
    };
    return AchievementGroup;
}());
var Achievement = /** @class */ (function () {
    function Achievement(group, description) {
        this.group = group;
        this.description = description;
        this.completed = false;
        this.parent = null;
        this.data = {
            progress: 0,
            data: {}
        };
        var parent = description.parent;
        if (parent) {
            var child = null;
            if (!parent.groupUnique || parent.groupUnique == group.getUid()) {
                child = group.getChild(parent.unique);
            }
            else {
                var otherGroup = AchievementAPI.groups[parent.groupUnique];
                if (otherGroup) {
                    child = otherGroup.getChild(parent.unique);
                }
                else {
                    throw new IllegalArgumentException("Parent not found: group uid is invalid");
                }
            }
            if (child) {
                this.parent = child;
            }
            else {
                throw new IllegalArgumentException("Parent not found: achievement uid is invalid");
            }
        }
    }
    Achievement.prototype.give = function () {
        if (this.isCompleted()) {
            return;
        }
        if (this.parent && !this.parent.isCompleted()) {
            return; //Throw an exception? Hm...
        }
        if (this.description.progressMax && ++this.data.progress < this.description.progressMax) {
            return;
        }
        if (!this.description.notCompletePopup) {
            var item = this.description.item;
            var title = void 0;
            var color = void 0;
            switch (this.description.type) {
                case "challenge":
                    title = Translation.translate("message.achievementApi.challenge_complete");
                    color = android.graphics.Color.MAGENTA;
                    break;
                case "goal":
                    title = Translation.translate("message.achievementApi.goal_complete");
                    color = android.graphics.Color.YELLOW;
                    break;
                default:
                    title = Translation.translate("message.achievementApi.achievement_complete");
                    color = android.graphics.Color.YELLOW;
            }
            AchievementPopup.show({
                title: title,
                color: color,
                description: AchievementAPI.getLocalized(this.description, "name"),
                item: {
                    id: item.id || 1,
                    data: item.data || 0,
                    count: 1
                }
            });
        }
        this.completed = true;
        Callback.invokeCallback("onAchieve", this.group.getDescription(), this.getDescription());
        Callback.invokeCallback("onAchievementCompleted", this);
    };
    Achievement.prototype.reset = function () {
        this.completed = false;
        this.data.progress = 0;
        this.data.data = {};
    };
    /**
     * Show alert with information about achievement
     */
    Achievement.prototype.showAlert = function () {
        var info = AchievementAPI.getLocalized(this.description, "name");
        if (this.description.progressMax) {
            info += "(" + this.getProgress() + "/" + this.description.progressMax + ")";
        }
        var description = AchievementAPI.getLocalized(this.description, "description");
        if (description) {
            info += "\n" + description;
        }
        alert(info);
    };
    /**
     * @return Is the achievement unlocked?
     */
    Achievement.prototype.isUnlocked = function () {
        return this.parent ? this.parent.isCompleted() : true;
    };
    /**
     * @return Is the achievement completed?
     */
    Achievement.prototype.isCompleted = function () {
        return this.completed;
    };
    Achievement.prototype.isStrongDependence = function () {
        return this.description.strongDependence;
    };
    Achievement.prototype.getTextureName = function () {
        var type;
        if (this.isCompleted()) {
            type = "completed";
        }
        else if (this.isUnlocked()) {
            type = "unlocked";
        }
        else {
            type = "locked";
        }
        return "achievement_bg." + (this.description.type || "default") + "_" + type;
    };
    Achievement.prototype.getParent = function () {
        return this.parent;
    };
    Achievement.prototype.getProgress = function () {
        return this.data.progress;
    };
    Achievement.prototype.getUid = function () {
        return this.description.unique;
    };
    Achievement.prototype.getDescription = function () {
        return this.description;
    };
    Achievement.prototype.getFullData = function () {
        return this.data;
    };
    Achievement.prototype.getIcon = function () {
        return this.description.item;
    };
    Achievement.prototype.getGroup = function () {
        return this.group;
    };
    Achievement.prototype.getData = function () {
        return this.data.data;
    };
    Achievement.prototype.setCompleted = function (value) {
        this.completed = value;
    };
    Achievement.prototype.setData = function (value) {
        this.data = value;
    };
    return Achievement;
}());
var TileMode = android.graphics.Shader.TileMode;
var AchievementAPI = /** @class */ (function () {
    function AchievementAPI() {
    }

    /**
     * Initialize windows
     */
    AchievementAPI.init = function () {
        this.groupsShowUI.setAsGameOverlay(true);
        this.windowParent.setBlockingBackground(true);
    };
    /**
     * Register new group
     * @param description - description object
     */
    AchievementAPI.registerGroup = function (description) {
        var group = new AchievementGroup(description);
        if (this.groups[group.getUid()]) {
            throw new IllegalArgumentException("Group with uid \"${uid}\" already registered");
        }
        this.groups[group.getUid()] = group;
        this.groupsAmount++;
        return group;
    };
    /**
     * Register new achievement
     * @param uid - group unique identifier
     * @param description - description object
     */
    AchievementAPI.register = function (uid, description) {
        var group = this.groups[uid];
        if (!group) {
            throw new IllegalArgumentException("Invalid group uid");
        }
        var parent = description.parent;
        if (parent && !parent.groupUnique) {
            parent.groupUnique = uid;
        }
        var achievement = new Achievement(group, description);
        group.addChildren(achievement);
        return achievement;
    };
    //noinspection JSUnusedGlobalSymbols
    /**
     * Load groups and achievements from JSON file
     * @param path - path to JSON
     * @example <i>AchievementAPI.loadFrom(\_\_dir\_\_ + "/achievements.json")</i>
     */
    AchievementAPI.loadFrom = function (path) {
        var content = FileTools.ReadText(path);
        if (content) {
            var parsed = JSON.parse(content);
            var groups = parsed.groups;
            if (groups) {
                for (var key in groups) {
                    AchievementAPI.registerGroup(groups[key]);
                }
            }
            var achievements = parsed.achievements;
            if (achievements) {
                for (var key in achievements) {
                    var achievementGroup = achievements[key];
                    for (var key2 in achievementGroup) {
                        AchievementAPI.register(key, achievementGroup[key2]);
                    }
                }
            }
            return;
        }
        Logger.Log("Error loading file " + path, "ERROR");
    };
    AchievementAPI.initGroupForWindow = function (group) {
        var parentElements = this.windowParent.getContent().elements;
        parentElements["textPageIndex"].text = (this.currentIndex + 1) + "/" + this.groupsAmount;
        parentElements["textGroupName"].text = group.getName() || "";
        var slotIcon = this.parentContainer.getSlot("slotGroupIcon");
        var groupIcon = group.getIcon();
        if (groupIcon) {
            slotIcon.id = groupIcon.id || 0;
            slotIcon.data = groupIcon.data || 0;
            slotIcon.count = 1;
        }
        else {
            slotIcon.id = 0;
            slotIcon.data = 0;
            slotIcon.count = 1;
        }
    };
    AchievementAPI.initAchievementsForWindow = function (group, size, elements) {
        var _a, _b;
        var contentExist;
        var _loop_1 = function (index) {
            var achievement = group.getChild(index);
            var parent = achievement.getParent();
            if (parent) {
                if (!parent.isCompleted() && achievement.isStrongDependence()) {
                    return "continue";
                }
            }
            contentExist = true;
            var x = this_1.getAchievementX(achievement.getDescription(), size);
            var y = this_1.getAchievementY(achievement.getDescription(), size);
            elements[index] = {
                type: "slot",
                x: x,
                y: y,
                size: size,
                visual: true,
                bitmap: achievement.getTextureName(),
                isTransparentBackground: true,
                clicker: {
                    onClick: function () {
                        achievement.showAlert();
                    }
                }
            };
            var item = achievement.getIcon() || { id: 0, data: 0 };
            var slot = this_1.container.getSlot(index);
            slot.id = (_a = item === null || item === void 0 ? void 0 : item.id) !== null && _a !== void 0 ? _a : 0;
            slot.data = (_b = item === null || item === void 0 ? void 0 : item.data) !== null && _b !== void 0 ? _b : 0;
            slot.count = 1;
        };
        var this_1 = this;
        for (var index in group.getChildren()) {
            _loop_1(index);
        }
        return contentExist;
    };
    AchievementAPI.initConditionsForWindow = function (group, size, elements) {
        var halfOfSize = size / 2;
        //noinspection JSUnusedGlobalSymbols
        elements["lines"] = {
            type: "custom",
            z: -1,
            custom: {},
            onSetup: function () {
                this.paint = new android.graphics.Paint();
                this.paint.setARGB(255, 255, 255, 255);
                this.paint.setStyle(android.graphics.Paint.Style.STROKE);
                this.paint2 = new android.graphics.Paint();
                this.paint2.setARGB(255, 0, 0, 0);
                this.paint2.setStyle(android.graphics.Paint.Style.STROKE);
            },
            onDraw: function (self, canvas, scale) {
                if (!this.path) {
                    this.path = new android.graphics.Path();
                    for (var index in group.getChildren()) {
                        var achievement = group.getChild(index);
                        var parent = achievement.getParent();
                        if (!parent || parent.getGroup().getUid() !== group.getUid() ||
                            (!parent.isCompleted() && achievement.isStrongDependence())) {
                            continue;
                        }
                        var parentItem = group.getChild(parent.getUid());
                        if (parentItem) {
                            var x = AchievementAPI.getAchievementX(achievement.getDescription(), size);
                            var y = AchievementAPI.getAchievementY(achievement.getDescription(), size);
                            var _x = (x + halfOfSize) * scale;
                            var _y = (y + halfOfSize) * scale;
                            var parentX = AchievementAPI.getAchievementX(parentItem.getDescription(), size);
                            var parentY = AchievementAPI.getAchievementY(parentItem.getDescription(), size);
                            var _parentX = (parentX + halfOfSize) * scale;
                            var _parentY = (parentY + halfOfSize) * scale;
                            if (parentX === x || parentY === y) {
                                this.path.moveTo(_x, _y);
                                this.path.lineTo(_parentX, _parentY);
                            } else {
                                var x2 = _x + ((parentX < x ? -(halfOfSize + 5) : halfOfSize + 5) * scale);
                                this.path.moveTo(_x, _y);
                                this.path.lineTo(x2, _y);
                                this.path.lineTo(x2, _parentY);
                                this.path.lineTo(_parentX, _parentY);
                            }
                        }
                    }
                }
                this.paint.setStrokeWidth(6 * scale);
                this.paint2.setStrokeWidth(14 * scale);
                canvas.drawPath(this.path, this.paint2);
                canvas.drawPath(this.path, this.paint);
            }
        };
    };
    AchievementAPI.initBackgroundForWindow = function (drawing, bgTexture) {
        //noinspection JSUnusedGlobalSymbols
        drawing.push({
            type: "custom",
            onDraw: function (canvas, scale) {
                var bitmap = android.graphics.Bitmap.createScaledBitmap(UI.TextureSource.get(bgTexture), 80 * scale, 80 * scale, false);
                var paint = new android.graphics.Paint();
                paint.setShader(new android.graphics.BitmapShader(bitmap, TileMode.REPEAT, TileMode.REPEAT));
                canvas.drawRect(0, 0, canvas.getWidth(), canvas.getHeight(), paint);
                bitmap.recycle();
            }
        });
    };
    /**
     * Open achievement window
     */
    AchievementAPI.openAchievementsWindow = function () {
        if (this.currentIndex < 0) {
            this.currentIndex = this.groupsAmount - 1;
        }
        else if (this.currentIndex >= this.groupsAmount) {
            this.currentIndex = 0;
        }
        var group = this.groups[this.groupNames[AchievementAPI.currentIndex]];
        var width = group.getWidth() || 600;
        var height = group.getHeight() || 250;
        var elements = {};
        var drawing = [{ type: "color", color: android.graphics.Color.rgb(0, 0, 0) }];
        this.initGroupForWindow(group);
        var size = group.getAchievementSize() || 100;
        var contentExist = this.initAchievementsForWindow(group, size, elements);
        if (contentExist) {
            this.initConditionsForWindow(group, size, elements);
            if (group.getBgTextureName()) {
                this.initBackgroundForWindow(drawing, group.getBgTextureName());
            }
        }
        else {
            width = 432;
            height = 260;
            var translated = Translation.translate("achievementApi.nothing");
            if (translated === "achievementApi.nothing") {
                translated = "Nothing to Show :(";
            }
            elements["nothing"] = {
                type: "text",
                x: 0,
                y: 200,
                text: translated,
                font: { size: 40, color: android.graphics.Color.WHITE }
            };
        }
        if (this.windowArea) {
            this.windowArea.close();
        }
        this.windowArea = new UI.Window({
            location: {
                x: 284,
                y: (UI.getScreenHeight() - 370) / 2 + 50,
                width: 432,
                height: 260,
                scrollX: width,
                scrollY: height
            },
            drawing: drawing,
            elements: elements
        });
        AchievementAPI.container.openAs(this.windowArea);
        if (!contentExist) {
            elements["nothing"].x = (1000 - AchievementAPI.container.getElement("nothing").elementRect.width()) / 2;
        }
    };
    //noinspection JSUnusedGlobalSymbols
    /**
     * @param groupUID - group identifier in which achievement contains
     * @param uid - achievement identifier
     * @returns Is the achievement unlocked?
     */
    AchievementAPI.isUnlocked = function (groupUID, uid) {
        var group = this.groups[groupUID];
        if (!group) {
            throw new IllegalArgumentException("Group with uid '" + groupUID + "' not found");
        }
        var achievement = group.getChild(uid);
        if (!achievement) {
            throw new IllegalArgumentException("Achievement with uid '" + groupUID + "' not found");
        }
        return achievement.isUnlocked();
    };
    /**
     * Give all achievements
     */
    AchievementAPI.giveAll = function () {
        for (var key in this.groups) {
            this.groups[key].giveAll();
        }
    };
    /**
     * @param groupUID - group identifier in which achievement contains
     * @param uid - achievement identifier
     * @returns Is the achievement completed?
     */
    AchievementAPI.isCompleted = function (groupUID, uid) {
        return this.groups[groupUID].getChild(uid).isCompleted();
    };
    /**
     * Give the achievement
     * @param groupUID - group identifier
     * @param uid - achievement identifier
     */
    AchievementAPI.give = function (groupUID, uid) {
        var group = this.groups[groupUID];
        if (!group) {
            throw new IllegalArgumentException("Group with uid '" + groupUID + "' not found");
        }
        group.give(uid);
    };
    AchievementAPI.resetAll = function () {
        for (var groupKey in this.groups) {
            var group = this.groups[groupKey];
            for (var key in group.getChildren()) {
                var child = group.getChild(key);
                child.reset();
            }
        }
    };
    AchievementAPI.getGroup = function (uid) {
        return this.groups[uid];
    };
    /*
        {                                 }
        {           DEPRECATED            }
        {                                 }
     */
    /**
     * @deprecated
     */
    AchievementAPI.getLocalized = function (achievement, field) {
        var obj = achievement[field];
        if (obj) {
            if (obj.translate) {
                var translated = Translation.translate(obj.translate);
                return translated === obj.translate ? obj.text : translated;
            }
            return obj.text;
        }
        return "";
    };
    /**
     * @deprecated
     */
    AchievementAPI.getAchievementY = function (achievement, size) {
        return achievement.y || achievement.row * (size + 10);
    };
    /**
     * @deprecated
     */
    AchievementAPI.getAchievementX = function (achievement, size) {
        return achievement.x || achievement.column * (size + 10);
    };
    //noinspection JSUnusedGlobalSymbols
    /**
     * @deprecated
     */
    AchievementAPI.getAchievementTexture = function (groupDesc, achievement) {
        var group = this.groups[groupDesc.unique];
        if (!group) {
            throw new IllegalArgumentException("Invalid group uid");
        }
        var child = group.getChild(achievement.unique);
        if (!child) {
            throw new IllegalArgumentException("Invalid achievement uid");
        }
        return child.getTextureName();
    };
    /**
     * @deprecated
     */
    AchievementAPI.getData = function (groupUID, uid) {
        var group = this.groups[groupUID];
        if (!group) {
            throw new IllegalArgumentException("Invalid group uid");
        }
        var child = group.getChild(uid);
        if (!child) {
            throw new IllegalArgumentException("Invalid achievement uid");
        }
        return child.getFullData();
    };
    //noinspection JSUnusedGlobalSymbols
    /**
     * @deprecated
     */
    AchievementAPI.showAchievementInfo = function (groupDescription, achievement) {
        var group = this.groups[groupDescription.unique];
        if (!group) {
            return;
        }
        var child = group.getChild(achievement.unique);
        if (!child) {
            return;
        }
        child.showAlert();
    };
    /**
     * @deprecated
     */
    AchievementAPI.giveAllForGroup = function (description) {
        var group = this.groups[description.unique];
        if (!group) {
            return false;
        }
        group.giveAll();
        return true;
    };
    //noinspection JSUnusedGlobalSymbols,JSUnusedLocalSymbols
    /**
     * @deprecated
     */
    AchievementAPI.removeDataFor = function (groupUID, uid) {
    };
    /**
     * @deprecated
     */
    AchievementAPI.getProgress = function (group, achievement) {
        return this.groups[group.unique].getChild(achievement.unique).getProgress();
    };
    /**
     * Array of registered groups by <i>AchievementAPI.registerGroup</i>
     */
    AchievementAPI.groups = {};
    /**
     * Array of groups identifiers
     */
    AchievementAPI.groupNames = [];
    /**
     * Amount of registered groups
     */
    AchievementAPI.groupsAmount = 0;
    /**
     * Container of <i>groupsShowUI</i>
     */
    AchievementAPI.containerOverlay = new UI.Container();
    /**
     * Container of achievements area window
     */
    AchievementAPI.container = new UI.Container();
    /**
     * Container of <i>windowParent</i>
     */
    AchievementAPI.parentContainer = new UI.Container();
    /**
     * Current group index
     */
    AchievementAPI.currentIndex = 0;
    AchievementAPI.windowArea = null;
    /**
     * Background window
     */
    AchievementAPI.windowParent = new UI.Window({
        location: {
            x: 244,
            y: (UI.getScreenHeight() - 370) / 2,
            width: 512,
            height: 370
        },
        drawing: [
            { type: "frame", x: 0, y: 0, width: 1000, height: 725, bitmap: "achievements_frame", scale: 5 },
            {
                type: "text",
                text: Translation.translate("achievementApi.achievements"),
                x: 80,
                y: 65,
                font: { size: 35, color: android.graphics.Color.DKGRAY }
            }
        ],
        elements: {
            "slotGroupIcon": {
                type: "slot",
                x: 75,
                y: 605,
                size: 100,
                visual: true,
                bitmap: "_default_slot_empty",
                isTransparentBackground: true
            },
            "textGroupName": {
                type: "text",
                x: 180,
                y: 630,
                text: "",
                font: { size: 40, color: android.graphics.Color.DKGRAY }
            },
            "btnClose": {
                type: "button",
                x: 910,
                y: 15,
                bitmap: "achievements_btn_close",
                bitmap2: "achievements_btn_close_hover",
                scale: 5,
                clicker: {
                    onClick: function () {
                        AchievementAPI.windowParent.close();
                        AchievementAPI.windowArea.close();
                    }
                }
            },
            "textPageIndex": {
                type: "text",
                x: 730,
                y: 630,
                text: "",
                font: { size: 40, color: android.graphics.Color.DKGRAY }
            },
            "btnNext": {
                type: "button",
                x: 860,
                y: 620,
                bitmap: "btn_achievements_next",
                bitmap2: "btn_achievements_next_hover",
                scale: 3,
                clicker: {
                    onClick: function () {
                        AchievementAPI.currentIndex++;
                        AchievementAPI.openAchievementsWindow();
                    }
                }
            },
            "btnPrevious": {
                type: "button",
                x: 640,
                y: 620,
                bitmap: "btn_achievements_previous",
                bitmap2: "btn_achievements_previous_hover",
                scale: 3,
                clicker: {
                    onClick: function () {
                        AchievementAPI.currentIndex--;
                        AchievementAPI.openAchievementsWindow();
                    }
                }
            }
        }
    });
    /**
     * Window with button that open achievements window
     */
    AchievementAPI.groupsShowUI = new UI.Window({
        location: {
            x: 1000 / 2 - 80,
            y: 5,
            width: 45,
            height: 45
        },
        drawing: [
            { type: "color", color: android.graphics.Color.argb(0, 0, 0, 0) }
        ],
        elements: {
            "btn": {
                type: "button", x: 0, y: 0, bitmap: "btn_achievements", scale: 60, clicker: {
                    onClick: function () {
                        AchievementAPI.currentIndex = 0;
                        AchievementAPI.parentContainer.openAs(AchievementAPI.windowParent);
                        AchievementAPI.openAchievementsWindow();
                    }
                }
            }
        }
    });
    return AchievementAPI;
}());
AchievementAPI.init();
Callback.addCallback("PostLoaded", function () {
    AchievementAPI.groupNames = Object.keys(AchievementAPI.groups);
});
Callback.addCallback("NativeGuiChanged", function (screenName) {
    if (screenName === "hud_screen" || screenName === "in_game_play_screen") {
        AchievementAPI.containerOverlay.openAs(AchievementAPI.groupsShowUI);
    }
    else {
        AchievementAPI.containerOverlay.close();
    }
});
Callback.addCallback("LevelLeft", function () {
    AchievementAPI.resetAll();
});
EXPORT("AchievementAPI", AchievementAPI);
Saver.addSavesScope("AchievementsScope", function read(scope) {
    //Detecting old saves //TODO: delete in next versions
    var amount = 0;
    var isOldSaves = true;
    for (var key in scope) {
        amount++;
        if (amount > 2) {
            isOldSaves = false;
            break;
        }
        if (key != "completed" && key != "data") {
            isOldSaves = false;
            break;
        }
    }
    if (isOldSaves) {
        isOldSaves = amount == 2;
    }
    if (isOldSaves) { //Convert old format to new one
        // @ts-ignore
        var saves = scope;
        var newSaves = {};
        for (var key in saves.completed) {
            var parts = key.split("_");
            var data = newSaves[parts[0]];
            if (!data) {
                data = newSaves[parts[0]] = {};
            }
            data[parts[1]] = { completed: saves.completed[key], data: { progress: 0, data: {} } };
        }
        for (var key in saves.data) {
            var parts = key.split("_");
            var data = newSaves[parts[0]];
            if (!data) {
                data = newSaves[parts[0]] = {};
            }
            var data2 = data[parts[1]];
            if (!data2) {
                data2 = data[parts[1]] = { completed: false, data: saves.data[key] };
            }
            else {
                data2.data = saves.data[key];
            }
        }
        scope = newSaves;
    }
    for (var groupKey in scope) {
        var group = AchievementAPI.getGroup(groupKey);
        var data = scope[groupKey];
        if (group) {
            for (var key in data) {
                var child = group.getChild(key);
                var saved = data[key];
                if (child) {
                    child.setCompleted(saved.completed);
                    child.setData(saved.data);
                }
                else {
                    Logger.Log("Achievement with uid '" + key + "' not found. Skipping...", "WARNING");
                }
            }
        }
        else {
            Logger.Log("Group with uid '" + groupKey + "' not found. Skipping...", "WARNING");
        }
    }
}, function save() {
    var data = {};
    for (var groupKey in AchievementAPI.groups) {
        var group = AchievementAPI.groups[groupKey];
        var _data = {};
        for (var key in group.getChildren()) {
            var child = group.getChild(key);
            _data[key] = {
                completed: child.isCompleted(),
                data: child.getFullData()
            };
        }
        data[groupKey] = _data;
    }
    return data;
});
Callback.addCallback("NativeCommand", function (str) {
    str = str.replace("/", "");
    var parts = str.split(" ");
    if (parts[0] === "ach" || parts[0] === "achievement") {
        switch (parts[1]) {
            case "giveAll":
                AchievementAPI.giveAll();
                Game.message("[AchievementAPI] All achievements was gave");
                Game.prevent();
                return;
            case "give":
                if (!parts[2] || !AchievementAPI.giveAllForGroup(AchievementAPI.groups[parts[2]].getDescription())) {
                    return;
                }
                Game.message("[AchievementAPI] Achievements was gave!");
                Game.prevent();
                return;
            case "consumeAll":
                AchievementAPI.resetAll();
                Game.message("[AchievementAPI] All achievements was consumed");
                Game.prevent();
        }
    }
});

const AchievementAPI = {
    /**
     * Заригестрированные группы достижений. Ключом является уникальный идентификатор
     */
    groups: {},
    /**
     * Массив идентификаторов групп достижений
     */
    groupNames: null,
    /**
     * Кол-во заригестрированных групп
     */
    groupsAmount: 0,
    /**
     * Выполненные достижения. Ключом является строка "идентификаторГруппы_идентификаторДостижения"
     */
    completed: {},
    /**
     * Информация о достижениях. Ключом является строка "идентификаторГруппы_идентификаторДостижения". Хранящиеся объекты
     * содержат поля progress и data. Первое - прогресс выполения достижения, а data - объект, в который можно сохранять
     * какую-либо информацию. Получить его можно с помощью метода getData
     */
    data: {},
    /**
     * Контейнер окна с кнопкой для открытия меню достижений
     */
    containerOverlay: new UI.Container(),
    /**
     * Контейнер области достижений
     */
    container: new UI.Container(),
    /**
     * Контейнер родительского окна меню достижений
     */
    parentContainer: new UI.Container(),
    /**
     * Текущий индекс группы в меню достижений
     */
    currentIndex: 0,

    /**
     * Инициализирует окно
     */
    init: function () {
        this.groupsShowUI = new UI.Window({
            location: {
                x: 1000 / 2 - 80,
                y: 5,
                width: 45,
                height: 45
            },

            drawing: [
                {type: "color", color: Color.argb(0, 0, 0, 0)}
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
        this.groupsShowUI.setAsGameOverlay(true);

        this.windowParent = new UI.Window({
            location: {
                x: 244,
                y: (UI.getScreenHeight() - 370) / 2,
                width: 512,
                height: 370
            },
            drawing: [
                {type: "color", color: Color.rgb(198, 198, 198)},
                {type: "frame", x: 0, y: 0, width: 1000, height: 725, bitmap: "achievements_frame", scale: 5},
                {
                    type: "text",
                    text: Translation.translate("achievementApi.achievements"),
                    x: 80,
                    y: 65,
                    font: {size: 35, color: Color.DKGRAY}
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
                    font: {size: 40, color: Color.DKGRAY}
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
                    font: {size: 40, color: Color.DKGRAY}
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
        this.windowParent.setBlockingBackground(true);
    },

    /**
     * Регистрация группы достижений
     * @param obj объект, описывающий группу
     */
    registerGroup: function (obj) {
        let unique = obj.unique;

        if (!unique) {
            Logger.Log("Unique is not set!");
            return;
        }

        if (this.groups[unique]) {
            Logger.Log("Group(" + unique + ") already registed!");
            return;
        }

        this.groups[unique] = obj;
        this.groupsAmount++;
    },

    /**
     * Регистрация достижения
     * @param groupUnique идентификатор группы, в которую необходимо добавить достижение. Если данной группы не существует,
     * будет выведена ошибка
     * @param obj объект, описывающий достижение
     */
    register: function (groupUnique, obj) {
        let group = this.groups[groupUnique];
        let unique = obj.unique;

        if (!group) {
            Logger.Log("Unique group id is not set", "ERROR");
            return;
        }

        if (!unique || group[unique]) {
            Logger.Log("Achievement already registered or unique equals null", "ERROR");
            return;
        }

        if (!group.list)
            group.list = {};

        let parent = obj.parent;
        if (parent && !parent.groupUnique)
            parent.groupUnique = groupUnique;

        group.list[unique] = obj;
    },

    /**
     * Загрузка достижений и групп из JSON файла
     * @param path путь к JSON файлу
     */
    loadFrom: function (path) {
        let content = FileTools.ReadText(path);

        if (content) {
            let parsed = JSON.parse(content);

            let groups = parsed.groups;
            if (groups) {
                for (let key in groups)
                    AchievementAPI.registerGroup(groups[key]);

            }

            let achievements = parsed.achievements;
            if (achievements) {
                for (let key in achievements) {
                    let achievementGroup = achievements[key];
                    for (let key2 in achievementGroup)
                        AchievementAPI.register(key, achievementGroup[key2]);
                }
            }

            return;
        }

        Logger.Log("Error loading file " + path, "ERROR");
    },

    /**
     * Возвращает название текстуры для достижения
     * @param group объект, описывающий группу, в которой находится достижение
     * @param achievement объект, описывающий достижение
     * @returns {string}
     */
    getAchievementTexture: function (group, achievement) {
        let type;

        if (AchievementAPI.isCompleted(group.unique, achievement.unique))
            type = "completed";
        else if (AchievementAPI.isUnlocked_(group, achievement))
            type = "unlocked";
        else type = "locked";

        return "achievement_bg." + (achievement.type || "default") + "_" + type;
    },

    /**
     * Возвращает координату достижения в меню
     * @param achievement объект, описывающий достижение
     * @param size размер достижения
     * @returns {number} x
     */
    getAchievementX: function (achievement, size) {
        return achievement.x || achievement.column * (size + 10);
    },

    /**
     * Возвращает координату достижения в меню
     * @param achievement объект, описывающий достижение
     * @param size размер достижения
     * @returns {number} y
     */
    getAchievementY: function (achievement, size) {
        return achievement.y || achievement.row * (size + 10);
    },

    initGroupForWindow: function (group) {
        try {
            let parentElements = this.windowParent.getContent().elements;
            parentElements["textPageIndex"].text = (this.currentIndex + 1) + "/" + this.groupsAmount;
            parentElements["textGroupName"].text = group.name || "";

            let slotIcon = this.parentContainer.getSlot("slotGroupIcon");
            let groupIcon = group.icon;

            if (groupIcon) {
                slotIcon.id = groupIcon.id || 0;
                slotIcon.data = groupIcon.data || 0;
                slotIcon.count = 1;
            } else {
                slotIcon.id = 0;
                slotIcon.data = 0;
                slotIcon.count = 1;
            }
        } catch (e) {
            alert("3" + e);
        }
    },

    initAchievementsForWindow: function (group, size, elements) {
        let contentExist;
        for (let index in group.list) {
            let achievement = group.list[index];
            let parent = achievement.parent;

            if (parent) {
                if (!AchievementAPI.isCompleted(parent.groupUnique, parent.unique) && achievement.strongDependence)
                    continue;
            }
            contentExist = true;

            let x = this.getAchievementX(achievement, size);
            let y = this.getAchievementY(achievement, size);

            elements[index] = {
                type: "slot",
                x: x,
                y: y,
                size: size,
                visual: true,
                bitmap: AchievementAPI.getAchievementTexture(group, achievement),
                isTransparentBackground: true,
                clicker: {
                    onClick: function () {
                        AchievementAPI.showAchievementInfo(group, achievement);
                    }
                }
            };

            let item = achievement.item || {};

            let slot = this.container.getSlot(index);
            slot.id = item.id || 0;
            slot.data = item.data || 0;
            slot.count = item.count || 1;
        }

        return contentExist;
    },

    initConditionsForWindow: function (group, size, elements) {
        let halfOfSize = size / 2;
        elements["lines"] = {
            type: "custom",
            z: -1,
            custom: {},

            onSetup: function () {
                this.paint = new android.graphics.Paint();
                this.paint.setColor(Color.WHITE);
                this.paint.setStyle(android.graphics.Paint.Style.STROKE);
                this.paint.setStrokeWidth(4);

                this.paint2 = new android.graphics.Paint();
                this.paint2.setColor(Color.BLACK);
                this.paint2.setStyle(android.graphics.Paint.Style.STROKE);
                this.paint2.setStrokeWidth(10);
            },

            onDraw: function (self, canvas, scale) {
                try {
                    if (!this.path) {
                        this.path = new android.graphics.Path();

                        for (let index in group.list) {
                            let achievement = group.list[index];
                            let parent = achievement.parent;
                            let parentItem;

                            if (!parent || parent.groupUnique !== group.unique ||
                                (!AchievementAPI.isCompleted(group.unique, parent.unique) && achievement.strongDependence))
                                continue;

                            if (parentItem = group.list[parent.unique]) {
                                let x = AchievementAPI.getAchievementX(achievement, size);
                                let y = AchievementAPI.getAchievementY(achievement, size);
                                let _x = (x + halfOfSize) * scale;
                                let _y = (y + halfOfSize) * scale;
                                let parentX = AchievementAPI.getAchievementX(parentItem, size);
                                let parentY = AchievementAPI.getAchievementY(parentItem, size);
                                let _parentX = (parentX + halfOfSize) * scale;
                                let _parentY = (parentY + halfOfSize) * scale;

                                if (parentX === x || parentY === y) {
                                    this.path.moveTo(_x, _y);
                                    this.path.lineTo(_parentX, _parentY);
                                } else {
                                    let x2 = _x + ((parentX < x ? -(halfOfSize + 5) : halfOfSize + 5) * scale);

                                    this.path.moveTo(_x, _y);
                                    this.path.lineTo(x2, _y);
                                    this.path.lineTo(x2, _parentY);
                                    this.path.lineTo(_parentX, _parentY);
                                }
                            }
                        }
                    }

                    canvas.drawPath(this.path, this.paint2);
                    canvas.drawPath(this.path, this.paint);
                } catch (e) {
                    alert(e);
                }
            }
        };
    },

    initBackgroundForWindow: function (drawing, bgTexture) {
        try {
            drawing.push({
                type: "custom",

                func: function (canvas) {
                    this.onDraw(canvas)
                },

                onDraw: function (canvas) {
                    let textureBitmap = Bitmap.createScaledBitmap(UI.TextureSource.get(bgTexture), 50, 50, false);

                    for (let i = 0; i <= canvas.getWidth() / 50; i++) {
                        for (let k = 0; k <= canvas.getHeight() / 50; k++) {
                            canvas.drawBitmap(textureBitmap, i * 50, k * 50, null);
                        }
                    }
                }
            });
        } catch (e) {
            alert("1" + e);
        }
    },

    /**
     * Открывает меню достижений. Отображаемая группа выбирается по индексу currentIndex. Если он больше количества
     * заригестрированных групп, полю будет установлено значение 0.
     */
    openAchievementsWindow: function () {
        if (this.currentIndex < 0)
            this.currentIndex = this.groupsAmount - 1;
        else if (this.currentIndex >= this.groupsAmount)
            this.currentIndex = 0;

        let group = this.groups[this.groupNames[AchievementAPI.currentIndex]];
        let width = group.width || 600;
        let height = group.height || 250;
        let elements = {};
        let drawing = [{type: "color", color: Color.rgb(0, 0, 0)}];

        this.initGroupForWindow(group);

        let size = group.size || 100;
        let contentExist = this.initAchievementsForWindow(group, size, elements);

        if (contentExist) {
            this.initConditionsForWindow(group, size, elements);

            if (group.bgTexture)
                this.initBackgroundForWindow(drawing, group.bgTexture);
        } else {
            width = 432;
            height = 260;

            let translated = Translation.translate("achievementApi.nothing");
            if (translated === "achievementApi.nothing")
                translated = "Nothing to Show :(";

            elements["nothing"] = {
                type: "text",
                x: 0,
                y: 200,
                text: translated,
                font: {size: 40, color: Color.WHITE}
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

    },

    /**
     * Возвращает локализированную строку, которая основывается на поле
     * @param achievement объект, описывающий достижение
     * @param field название поля
     * @returns {String} локализованная строка
     */
    getLocalized: function (achievement, field) {
        let obj = achievement[field];
        if (obj) {
            if (obj.translate) {
                let translated = Translation.translate(obj.translate);
                return translated === obj.translate ? obj.text : translated;
            }

            return obj.text;
        }

        return "";
    },

    /**
     * Показывает алерт с информацией о достижении
     * @param group объект, описывающий группу, в которой находиться достижение
     * @param achievement объект, описывающий достижение
     */
    showAchievementInfo: function (group, achievement) {
        let info = this.getLocalized(achievement, "name");

        if (achievement.progressMax) {
            info += "(" + this.getProgress(group, achievement) + "/" + achievement.progressMax + ")";
        }

        let description = this.getLocalized(achievement, "description");
        if (description)
            info += "\n" + description;

        alert(info);
    },

    /**
     * Выдаёт достижение игроку и показывает уведомления о его получении. Если у достижения, которого необходимо выполнить
     * задано поле progressMax и информация о прогрессе сохранена, значение прогресса будет инкрементировано, в противном
     * случае будет записана новая информация в data
     * @param groupUnique идентификатор группы, в которой находиться достижение
     * @param unique идентификатор достижения
     */
    give: function (groupUnique, unique) {
        let group = this.groups[groupUnique];
        if (!group)
            return;

        let list = group.list;
        let achievement = list[unique];
        if (!achievement)
            return;

        if (this.isCompleted(groupUnique, unique))
            return;

        let parent = achievement.parent;
        if (parent && !this.isCompleted(parent.groupUnique, parent.unique))
            return;

        let progressMax = achievement.progressMax;

        if (progressMax) {
            let progress = this.data[groupUnique + "_" + unique];

            if (!progress)
                progress = this.data[groupUnique + "_" + unique] = {progress: 0, data: {}};

            if (++progress.progress < progressMax)
                return;
            else this.removeDataFor(groupUnique, unique)
        }

        //Показываем уведомление о получении достижения
        if (!achievement.notCompletePopup) {
            let item = achievement.item;
            let title;
            let color;

            switch (achievement.type) {
                case "challenge":
                    title = Translation.translate("message.achievementApi.challenge_complete");
                    color = Color.MAGENTA;
                    break;
                case "goal":
                    title = Translation.translate("message.achievementApi.goal_complete");
                    color = Color.YELLOW;
                    break;
                default:
                    title = Translation.translate("message.achievementApi.achievement_complete");
                    color = Color.YELLOW;
            }

            AchievementPopup.show({
                title: title,
                color: color,
                description: this.getLocalized(achievement, "name"),
                item: {
                    id: item.id || 1,
                    data: item.data || 0,
                    count: 1
                }
            });
        }

        this.completed[groupUnique + "_" + unique] = true;
        Callback.invokeCallback("onAchieve", group, achievement);
    },

    /**
     * Выдача всех достижений определённой группы
     * @param group объект, описывающий группу
     * @returns {boolean} выданы ли все достижения
     */
    giveAllForGroup: function (group) {
        if (!group)
            return false;

        for (let key in group.list) {
            let achievement = group.list[key];
            this.completed[group.unique + "_" + achievement.unique] = true;
            Callback.invokeCallback("onAchieve", group, achievement);
        }

        return true;
    },

    /**
     * Выдача всех достижений игроку
     */
    giveAll: function () {
        for (let key in this.groups) {
            this.giveAllForGroup(this.groups[key]);
        }
    },

    /**
     * Выполнено ли определённое достижение
     * @param groupUnique идентификатор группы, в которой находиться достижение
     * @param unique идентификатор достижения
     * @returns {Boolean} выполнено ли достижение
     */
    isCompleted: function (groupUnique, unique) {
        return this.completed[groupUnique + "_" + unique];
    },

    /**
     * Разблокировано ли достижение
     * @param groupUnique идентификатор группы, в которой находиться достижение
     * @param unique идентификатор достижения
     * @returns {Boolean} разблокировано ли достижение
     */
    isUnlocked: function (groupUnique, unique) {
        let group = this.groups[groupUnique];
        if (!group)
            return false;

        let achievement = group.list[unique];
        if (!achievement)
            return false;

        let parent = achievement.parent;
        if (parent)
            return this.isCompleted(parent.groupUnique || group.unique, parent.unique);

        return true;
    },

    /**
     * Разблокировано ли достижение
     * @param group объект, описывающий группу, в которой находится достижение
     * @param achievement объект, описывающий достижение
     * @returns {Boolean} разблокировано ли достижение
     */
    isUnlocked_: function (group, achievement) {
        let parent = achievement.parent;

        if (parent)
            return this.isCompleted(parent.groupUnique || group.unique, parent.unique);

        return true;
    },

    /**
     * Возвращает прогресс выполнения достижения
     * @param group объект, описывающий группу, в которой находится достижение
     * @param achievement объект, описывающий достижение
     * @returns {number} прогресс выполнения достижения
     */
    getProgress: function (group, achievement) {
        let data = this.data[group.unique + "_" + achievement.unique];

        if (!data)
            return 0;

        return data.progress;
    },

    /**
     * Возвращает объект для сохранения информации о выполнении достижения
     * @param groupUnique идентификатор группы, в которой находиться достижение
     * @param unique идентификатор достижения
     * @returns {{}} объект для сохранения информации о выполнении достижения
     */
    getData: function (groupUnique, unique) {
        let data = this.data[groupUnique + "_" + unique];

        if (!data)
            data = this.data[groupUnique + "_" + unique] = {progress: 0, data: {}};

        return data;
    },

    /**
     * Удаление информации о выполнении достижении
     * @param groupUnique дентификатор группы, в которой находиться достижение
     * @param unique идентификатор достижения
     */
    removeDataFor(groupUnique, unique) {
        this.data[groupUnique + "_" + unique] = null;
    }
};

Callback.addCallback("PostLoaded", function () {
    AchievementAPI.groupNames = Object.keys(AchievementAPI.groups);
});

AchievementAPI.init();
AchievementAPI.loadFrom(__dir__ + "json/vanilla.json");

Callback.addCallback("NativeCommand", function (str) {
    str = str.replace("/", "");
    let parts = str.split(" ");

    if (parts[0] === "ach" || parts[0] === "achievement") {
        switch (parts[1]) {
            case "giveAll":
                AchievementAPI.giveAll();
                Game.message("[AchievementsAPI] All achievements was gave");
                Game.prevent();
                return;
            case "give":
                if (!parts[2] || !AchievementAPI.giveAllForGroup(AchievementAPI.groups[parts[2]]))
                    return;

                Game.message("[AchievementsAPI] Achievements was gave!");
                Game.prevent();
                return;
            case "consumeAll":
                AchievementAPI.completed = {};
                Game.message("[AchievementsAPI] All achievements was consumed");
                Game.prevent();
        }
    }
});

Saver.addSavesScope("AchievementsScope",
    function read(scope) {
        AchievementAPI.completed = scope.completed || {};
        AchievementAPI.data = scope.data || {};
        nether_coords = scope.nether_coords;
    },
    function save() {
        return {completed: AchievementAPI.completed, data: AchievementAPI.data, nether_coords: nether_coords};
    }
);

Callback.addCallback("NativeGuiChanged", function (screenName) {
    if (screenName === "hud_screen" || screenName === "in_game_play_screen")
        AchievementAPI.containerOverlay.openAs(AchievementAPI.groupsShowUI);
    else AchievementAPI.containerOverlay.close();
});
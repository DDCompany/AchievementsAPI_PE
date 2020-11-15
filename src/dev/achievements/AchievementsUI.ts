class AchievementsUI {
    static groupNames: string[] = [];
    static containerOverlay = new UI.Container();
    static container = new UI.Container();
    static parentContainer = new UI.Container();
    static currentIndex = 0;
    static windowArea: Nullable<UI.Window> = null;
    static windowParent = new UI.Window({
        location: {
            x: 244,
            y: (UI.getScreenHeight() - 370) / 2,
            width: 512,
            height: 370
        },
        drawing: [
            {type: "frame", x: 0, y: 0, width: 1000, height: 725, bitmap: "achievements_api.frames.window", scale: 5},
            {
                type: "text",
                text: Translation.translate("achievements_api.achievements"),
                x: 80,
                y: 65,
                font: {size: 35, color: android.graphics.Color.DKGRAY}
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
                font: {size: 40, color: android.graphics.Color.DKGRAY}
            },
            "btnClose": {
                type: "button",
                x: 910,
                y: 15,
                bitmap: "achievements_api.btn.close",
                bitmap2: "achievements_api.btn.close_hover",
                scale: 5,
                clicker: {
                    onClick() {
                        AchievementsUI.windowParent.close();
                        AchievementsUI.windowArea.close();
                    }
                }
            },
            "textPageIndex": {
                type: "text",
                x: 730,
                y: 630,
                text: "",
                font: {size: 40, color: android.graphics.Color.DKGRAY}
            },
            "btnNext": {
                type: "button",
                x: 860,
                y: 620,
                bitmap: "achievements_api.btn.next",
                bitmap2: "achievements_api.btn.next_hover",
                scale: 3,
                clicker: {
                    onClick() {
                        AchievementsUI.currentIndex++;
                        AchievementsUI.openAchievementsWindow();
                    }
                }
            },
            "btnPrevious": {
                type: "button",
                x: 640,
                y: 620,
                bitmap: "achievements_api.btn.previous",
                bitmap2: "achievements_api.btn.previous_hover",
                scale: 3,
                clicker: {
                    onClick() {
                        AchievementsUI.currentIndex--;
                        AchievementsUI.openAchievementsWindow();
                    }
                }
            }
        }
    });
    static groupsShowUI = new UI.Window({
        location: {
            x: 1000 / 2 - 80,
            y: 5,
            width: 45,
            height: 45
        },

        drawing: [
            {type: "color", color: android.graphics.Color.argb(0, 0, 0, 0)}
        ],

        elements: {
            "btn": {
                type: "button", x: 0, y: 0, bitmap: "achievements_api.btn.achievements", scale: 60, clicker: {
                    onClick() {
                        AchievementsUI.currentIndex = 0;
                        AchievementsUI.parentContainer.openAs(AchievementsUI.windowParent);
                        AchievementsUI.openAchievementsWindow();
                    }
                }
            }
        }
    });

    static init() {
        this.groupsShowUI.setAsGameOverlay(true);
        this.windowParent.setBlockingBackground(true);
    }

    static initGroupForWindow(group: AchievementGroup) {
        let parentElements = this.windowParent.getContent().elements;
        parentElements["textPageIndex"].text = (this.currentIndex + 1) + "/" + this.groupNames.length;
        parentElements["textGroupName"].text = Translation.translate(group.name);

        let slotIcon = this.parentContainer.getSlot("slotGroupIcon");
        let groupIcon = group.icon;

        if (groupIcon) {
            slotIcon.id = groupIcon.id || 0;
            slotIcon.data = groupIcon.data || 0;
        } else {
            slotIcon.id = 0;
            slotIcon.data = 0;
        }

        slotIcon.count = 1;
    }

    static initAchievementsForWindow(group: AchievementGroup, size: number, elements: UI.UIElementSet) {
        let contentExist;
        for (let index in group.children) {
            let achievement = group.getChild(index);
            let parent = achievement.parent;

            if (parent) {
                if (!achievement.parent.getFor(Player.get()).isCompleted && achievement.hidden) {
                    continue;
                }
            }
            contentExist = true;

            let x = this.getAchievementX(achievement.prototype, size);
            let y = this.getAchievementY(achievement.prototype, size);

            elements[index] = {
                type: "slot",
                x: x,
                y: y,
                size: size,
                visual: true,
                bitmap: achievement.getFor(Player.get()).texture,
                isTransparentBackground: true,
                clicker: {
                    onClick() {
                        //TODO
                    }
                }
            };

            const item = achievement.icon || {id: 0, data: 0};
            const slot = this.container.getSlot(index);
            slot.id = item?.id ?? 0;
            slot.data = item?.data ?? 0;
            slot.count = 1;
        }

        return contentExist;
    }

    static initConditionsForWindow(group: AchievementGroup, size: number, elements: UI.UIElementSet) {
        let halfOfSize = size / 2;
        //noinspection JSUnusedGlobalSymbols
        elements["lines"] = {
            type: "custom",
            z: -1,
            custom: {},

            onSetup() {
                this.paint = new android.graphics.Paint();
                this.paint.setARGB(255, 255, 255, 255);
                this.paint.setStyle(android.graphics.Paint.Style.STROKE);

                this.paint2 = new android.graphics.Paint();
                this.paint2.setARGB(255, 0, 0, 0);
                this.paint2.setStyle(android.graphics.Paint.Style.STROKE);
            },

            onDraw(self: unknown, canvas: android.graphics.Canvas, scale: number) {
                if (!this.path) {
                    this.path = new android.graphics.Path();

                    for (let index in group.children) {
                        let achievement = group.getChild(index);
                        let parent = achievement.parent;

                        if (achievement.prototype.connection === Connection.NONE) {
                            continue;
                        }

                        if (!parent || parent.group.uid !== group.uid ||
                            (!parent.getFor(Player.get()).isCompleted && achievement.hidden)) {
                            continue;
                        }

                        let parentItem = group.getChild(parent.uid);
                        if (parentItem) {
                            let x = AchievementsUI.getAchievementX(achievement.prototype, size);
                            let y = AchievementsUI.getAchievementY(achievement.prototype, size);
                            let _x = (x + halfOfSize) * scale;
                            let _y = (y + halfOfSize) * scale;
                            let parentX = AchievementsUI.getAchievementX(parentItem.prototype, size);
                            let parentY = AchievementsUI.getAchievementY(parentItem.prototype, size);
                            let _parentX = (parentX + halfOfSize) * scale;
                            let _parentY = (parentY + halfOfSize) * scale;

                            if (parentX === x || parentY === y) {
                                this.path.moveTo(_x, _y);
                                this.path.lineTo(_parentX, _parentY);
                            } else {
                                let x2 = _x + ((parentX < x ? -(halfOfSize + 5) : halfOfSize + 5) * scale);

                                this.path.moveTo(_x, _y);
                                this.path.lineTo(x2, _y);

                                switch (achievement.prototype.connection) {
                                    case Connection.HORIZONTAL:
                                        this.path.lineTo(x2, _parentY);
                                        this.path.lineTo(_parentX, _parentY);
                                        break;
                                    case Connection.VERTICAL:
                                        this.path.lineTo(_parentX, _y);
                                        this.path.lineTo(_parentX, _parentY);
                                        break;
                                    default:
                                }

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
    }

    static initBackgroundForWindow(drawing: UI.DrawingElement[], bgTexture: string) {
        //noinspection JSUnusedGlobalSymbols
        drawing.push({
            type: "custom",

            onDraw(canvas: android.graphics.Canvas, scale: number) {
                let bitmap = android.graphics.Bitmap.createScaledBitmap(UI.TextureSource.get(bgTexture), 80 * scale,
                    80 * scale,
                    false);
                let paint = new android.graphics.Paint();
                paint.setShader(new android.graphics.BitmapShader(bitmap, android.graphics.Shader.TileMode.REPEAT, android.graphics.Shader.TileMode.REPEAT));
                canvas.drawRect(0, 0, canvas.getWidth(), canvas.getHeight(), paint);
                bitmap.recycle();
            }
        });
    }

    static openAchievementsWindow() {
        const groupsAmount = this.groupNames.length;
        if (this.currentIndex < 0) {
            this.currentIndex = groupsAmount - 1;
        } else if (this.currentIndex >= groupsAmount) {
            this.currentIndex = 0;
        }

        let group = AchievementAPI.groups[this.groupNames[AchievementsUI.currentIndex]];
        let width = group.width || 600;
        let height = group.height || 250;
        let elements: UI.UIElementSet = {};
        let drawing = [{type: "color", color: android.graphics.Color.rgb(0, 0, 0)}];

        this.initGroupForWindow(group);

        let size = group.nodeSize || 100;
        let contentExist = this.initAchievementsForWindow(group, size, elements);

        if (contentExist) {
            this.initConditionsForWindow(group, size, elements);

            if (group.backgroundTexture) {
                this.initBackgroundForWindow(drawing, group.backgroundTexture);
            }
        } else {
            width = 432;
            height = 260;

            let translated = Translation.translate("achievements_api.nothing");
            elements["nothing"] = {
                type: "text",
                x: 0,
                y: 200,
                text: translated,
                font: {size: 40, color: android.graphics.Color.WHITE}
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

        AchievementsUI.container.openAs(this.windowArea);

        if (!contentExist) {
            elements["nothing"].x = (1000 - AchievementsUI.container.getElement("nothing").elementRect.width()) / 2;
        }
    }

    static getAchievementY(achievement: IAchievement, size: number): number {
        return achievement.y || achievement.row * (size + 10);
    }

    static getAchievementX(achievement: IAchievement, size: number): number {
        return achievement.x || achievement.column * (size + 10);
    }
}

AchievementsUI.init();

Callback.addCallback("NativeGuiChanged", (screenName: string) => {
    if (screenName === "hud_screen" || screenName === "in_game_play_screen") {
        AchievementsUI.containerOverlay.openAs(AchievementsUI.groupsShowUI);
    } else {
        AchievementsUI.containerOverlay.close();
    }
});

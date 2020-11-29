interface IAchievementsOpenPacket {
    isUnlocked: boolean,
    isParentCompleted: boolean,
    isCompleted: boolean,
    texture: string,
    progress: number
}

//WARNING: NOT RECOMMENDED USE METHODS FROM THIS CLASS BECAUSE OF IT WILL BE CHANGED IN FUTURE VERSIONS
class AchievementsUI {
    static groupNames: string[] = [];
    static container = new UI.Container();
    static parentContainer = new UI.Container();
    static currentIndex = 0;
    static windowArea: Nullable<UI.Window> = null;
    static windowParent = new UI.Window({
        location: {
            x: 244,
            y: (UI.getScreenHeight() - 370) / 2,
            width: 512,
            height: 370,
        },
        drawing: [
            {type: "frame", x: 0, y: 0, width: 1000, height: 725, bitmap: "achievements_api.frames.window", scale: 5},
            {
                type: "text",
                text: Translation.translate("achievements_api.achievements"),
                x: 80,
                y: 65,
                font: {size: 35, color: android.graphics.Color.DKGRAY},
            },
        ],
        elements: {
            "slotGroupIcon": {
                type: "slot",
                x: 75,
                y: 605,
                size: 100,
                visual: true,
                bitmap: "_default_slot_empty",
                isTransparentBackground: true,
            },
            "textGroupName": {
                type: "text",
                x: 180,
                y: 630,
                text: "",
                font: {size: 40, color: android.graphics.Color.DKGRAY},
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
                    },
                },
            },
            "textPageIndex": {
                type: "text",
                x: 730,
                y: 630,
                text: "",
                font: {size: 40, color: android.graphics.Color.DKGRAY},
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
                    },
                },
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
                    },
                },
            },
        },
    });

    static init() {
        this.windowParent.setBlockingBackground(true);
        this.setupClientSide();
        this.setupServerSide();
    }

    static setupServerSide() {
        Network.addServerPacket("achievements_api.open_ui", (client, data) => {
            const children = AchievementAPI.getGroup(data.uid).children;
            const dat: Record<string, IAchievementsOpenPacket> = {};
            for (const key in children) {
                const player = client.getPlayerUid();
                const child = children[key].for(player);
                dat[key] = {
                    isCompleted: child.isCompleted,
                    isUnlocked: child.isUnlocked,
                    isParentCompleted: child.achievement?.parent?.for(player)?.isCompleted ?? true,
                    progress: child.progress,
                    texture: child.texture,
                };
            }

            client.send("achievements_api.open_ui_client", dat);
        });
    }

    static setupClientSide() {
        Network.addClientPacket("achievements_api.open_ui_client", (data: Record<string, IAchievementsOpenPacket>) => {
            this._openAchievementsWindow(data);
        });
    }

    static initGroupForWindow(group: AchievementGroup) {
        const parentElements = this.windowParent.getContent().elements;
        parentElements["textPageIndex"].text = (this.currentIndex + 1) + "/" + this.groupNames.length;
        parentElements["textGroupName"].text = Translation.translate(group.name);

        const slotIcon = this.parentContainer.getSlot("slotGroupIcon");
        const groupIcon = group.icon;

        if (groupIcon) {
            slotIcon.id = groupIcon.id || 0;
            slotIcon.data = groupIcon.data || 0;
        } else {
            slotIcon.id = 0;
            slotIcon.data = 0;
        }

        slotIcon.count = 1;
    }

    static initAchievementsForWindow(group: AchievementGroup, size: number, elements: UI.UIElementSet,
                                     packet: Record<string, IAchievementsOpenPacket>) {
        let contentExist;
        for (const key in packet) {
            const achievement = group.getChild(key);
            if (!achievement) {
                continue;
            }

            const achievementData = packet[key];
            if (!achievementData.isParentCompleted && achievement.hidden) {
                continue;
            }

            contentExist = true;

            const x = this.getAchievementX(achievement.prototype, size);
            const y = this.getAchievementY(achievement.prototype, size);

            elements[key] = {
                type: "slot",
                x: x,
                y: y,
                size: size,
                visual: true,
                bitmap: achievementData.texture,
                isTransparentBackground: true,
                clicker: {
                    onClick() {
                        AchievementsUI.showInformationToast(achievement, achievementData);
                    },
                },
            };

            const item = achievement.icon || {id: 0, data: 0};
            const slot = this.container.getSlot(key);
            slot.id = item?.id ?? 0;
            slot.data = item?.data ?? 0;
            slot.count = 1;
        }

        return contentExist;
    }

    static showInformationToast(achievement: Achievement, data: IAchievementsOpenPacket) {
        let info = Translation.translate(achievement.name);

        if (achievement.prototype.progressMax) {
            info += `(${data.progress}/${achievement.prototype.progressMax})`;
        }

        const description = achievement.description;
        if (description) {
            info += "\n" + description;
        }

        alert(info);
    }

    static initConditionsForWindow(group: AchievementGroup, packet: Record<string, IAchievementsOpenPacket>,
                                   size: number, elements: UI.UIElementSet) {
        const halfOfSize = size / 2;
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

                    for (const key in packet) {
                        const achievement = group.getChild(key);
                        if (!achievement) {
                            continue;
                        }

                        const parent = achievement.parent;

                        if (achievement.prototype.connection === Connection.NONE) {
                            continue;
                        }

                        if (!parent || parent.group.uid !== group.uid ||
                            (!parent.for(Player.get()).isCompleted && achievement.hidden)) {
                            continue;
                        }

                        const parentItem = group.getChild(parent.uid);
                        if (parentItem) {
                            const x = AchievementsUI.getAchievementX(achievement.prototype, size);
                            const y = AchievementsUI.getAchievementY(achievement.prototype, size);
                            const _x = (x + halfOfSize) * scale;
                            const _y = (y + halfOfSize) * scale;
                            const parentX = AchievementsUI.getAchievementX(parentItem.prototype, size);
                            const parentY = AchievementsUI.getAchievementY(parentItem.prototype, size);
                            const _parentX = (parentX + halfOfSize) * scale;
                            const _parentY = (parentY + halfOfSize) * scale;

                            if (parentX === x || parentY === y) {
                                this.path.moveTo(_x, _y);
                                this.path.lineTo(_parentX, _parentY);
                            } else {
                                const x2 = _x + ((parentX < x ? -(halfOfSize + 5) : halfOfSize + 5) * scale);

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
            },
        };
    }

    static initBackgroundForWindow(drawing: UI.DrawingElement[], bgTexture: string) {
        //noinspection JSUnusedGlobalSymbols
        drawing.push({
            type: "custom",

            onDraw(canvas: android.graphics.Canvas, scale: number) {
                const bitmap = android.graphics.Bitmap.createScaledBitmap(UI.TextureSource.get(bgTexture), 80 * scale,
                    80 * scale,
                    false);
                const paint = new android.graphics.Paint();
                paint.setShader(new android.graphics.BitmapShader(bitmap, android.graphics.Shader.TileMode.REPEAT,
                    android.graphics.Shader.TileMode.REPEAT));
                canvas.drawRect(0, 0, canvas.getWidth(), canvas.getHeight(), paint);
                bitmap.recycle();
            },
        });
    }

    static openAchievementsWindow() {
        const groupsAmount = this.groupNames.length;
        if (this.currentIndex < 0) {
            this.currentIndex = groupsAmount - 1;
        } else if (this.currentIndex >= groupsAmount) {
            this.currentIndex = 0;
        }

        Network.sendToServer("achievements_api.open_ui", {uid: this.groupNames[this.currentIndex]});
    }

    static _openAchievementsWindow(packet: Record<string, IAchievementsOpenPacket>) {
        const group = AchievementAPI.groups[this.groupNames[AchievementsUI.currentIndex]];
        let width = group.width || 600;
        let height = group.height || 250;
        const elements: UI.UIElementSet = {};
        const drawing = [{type: "color", color: android.graphics.Color.rgb(0, 0, 0)}];

        this.initGroupForWindow(group);

        const size = group.nodeSize || 100;
        const contentExist = this.initAchievementsForWindow(group, size, elements, packet);

        if (contentExist) {
            this.initConditionsForWindow(group, packet, size, elements);

            if (group.backgroundTexture) {
                this.initBackgroundForWindow(drawing, group.backgroundTexture);
            }
        } else {
            width = 432;
            height = 260;

            const translated = Translation.translate("achievements_api.nothing");
            elements["nothing"] = {
                type: "text",
                x: 0,
                y: 200,
                text: translated,
                font: {size: 40, color: android.graphics.Color.WHITE},
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
                scrollY: height,
            },

            drawing: drawing,
            elements: elements,
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
    if (screenName == "xbl_optional_signin_screen - gui.achievements") {
        simulateBackPressed(); //close popup
        AchievementsUI.currentIndex = 0;
        AchievementsUI.parentContainer.openAs(AchievementsUI.windowParent);
        AchievementsUI.openAchievementsWindow();
    }
});

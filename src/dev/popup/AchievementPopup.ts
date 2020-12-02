/**
 * Class for managing popups on the screen
 */
class AchievementPopup {
    /**
     * The default color of popup title
     */
    static DEFAULT_TITLE_COLOR = android.graphics.Color.YELLOW;

    /**
     * The default time in ticks that popup will be on the screen
     */
    static DEFAULT_DELAY = 80;

    /**
     * Queue of popups to be displayed. Use <i>AchievementPopup.popQueue</i> to get last popup in the queue and
     * <i>AchievementPopup</i> to add new one
     */
    static popupQueue: IAchievementPopup[] = [];

    /**
     * Container of popup window
     */
    static container = new UI.Container();

    /**
     * Popup window
     */
    static popupUI = new UI.Window({
        location: {
            x: 700,
            y: 0,
            width: 300,
            height: 60,
        },

        drawing: [
            {type: "color", color: android.graphics.Color.rgb(33, 33, 33)},
            {
                type: "frame",
                x: 0,
                y: 0,
                width: 1000,
                height: 200,
                bitmap: "achievements_api.frames.achievement",
                scale: 5,
            },
        ],

        elements: {
            "title": {
                type: "text",
                text: "",
                x: 190,
                y: 30,
                font: {color: android.graphics.Color.YELLOW, size: 50},
            },

            "description": {
                type: "text",
                text: "",
                x: 190,
                y: 100,
                font: {color: android.graphics.Color.WHITE, size: 50},
            },

            "slot": {
                type: "slot",
                x: 5,
                y: 5,
                size: 190,
                bitmap: "_default_slot_empty",
                isTransparentBackground: true,
                visual: true,
            },
        },
    });

    /**
     * Time that popup showed on the screen. If the field more than 0, each tick decreased until becomes 0, after which
     * popup disappear
     */
    static delay = 0;

    private static validScreen = false;

    private static openedScreens: Array<UI.IWindow> = [];

    /**
     * Initialize the window
     */
    static init() {
        this.setupClientSide();
        this.popupUI.setAsGameOverlay(true);
        this.popupUI.setTouchable(false);
    }

    /**
     * Display notification
     * @param popup - popup for display
     */
    static show(popup: IAchievementPopup) {
        this.popupQueue.push(popup);
    }

    static showFor(client: NetworkClient, popup: IAchievementPopup) {
        client.send("achievements_api.show_popup", popup);
    }

    /**
     * @return last popup in queue
     */
    static popQueue(): Nullable<IAchievementPopup> {
        return this.popupQueue.pop() || null;
    }

    /**
     * Remove all popup from queue
     */
    static clearQueue() {
        this.popupQueue = [];
    }

    static setupClientSide() {
        Network.addClientPacket("achievements_api.show_popup", (popup: IAchievementPopup) => this.show(popup));

        Callback.addCallback("NativeGuiChanged", screen => {
            this.validScreen = screen === "hud_screen" || screen === "in_game_play_screen";
        });

        Callback.addCallback("CustomWindowOpened", (window: UI.Window | UI.WindowGroup) => {
            if (!window["isNotFocusable"] //WindowGroup
                || !(window.equals(this.popupUI) && window["isNotFocusable"]())) {
                this.openedScreens.push(window);
            }
        });

        Callback.addCallback("CustomWindowClosed", (window) => {
            const index = this.openedScreens.indexOf(window);
            if (index !== -1) {
                this.openedScreens.splice(index, 1);
            }
        });
    }

    static canBeShown() {
        return this.validScreen && !this.openedScreens.length;
    }
}

AchievementPopup.init();

Callback.addCallback("LocalTick", () => {
    if (!AchievementPopup.delay) {
        const popup = AchievementPopup.popQueue();

        if (popup) {
            const content = AchievementPopup.popupUI.getContent();
            const container = AchievementPopup.container;
            const elements = content.elements;
            const item = popup.item;
            const slot = container.getSlot("slot");

            elements.title.text = popup.title;
            elements.title.font.color = popup.color || AchievementPopup.DEFAULT_TITLE_COLOR;
            elements.description.text = popup.description;

            slot.id = item?.id ?? 0;
            slot.data = item?.data ?? 0;
            slot.count = item?.count ?? 1;

            AchievementPopup.delay = popup.delay || AchievementPopup.DEFAULT_DELAY;
        }

        return;
    }

    if (AchievementPopup.canBeShown()) {
        if (!AchievementPopup.popupUI.isOpened()) {
            AchievementPopup.container.openAs(AchievementPopup.popupUI);
        }
    } else {
        if (AchievementPopup.popupUI.isOpened()) {
            AchievementPopup.container.close();
        }
    }

    if (--AchievementPopup.delay <= 0) {
        AchievementPopup.delay = 0;
        AchievementPopup.container.close();
    }
});

Callback.addCallback("LevelLeft", () => {
    AchievementPopup.delay = 0;
    AchievementPopup.clearQueue();
});
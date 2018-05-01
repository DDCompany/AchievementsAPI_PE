const AchievementPopup = {
    /**
     * Очередь уведомлений на показ
     */
    popupQueue: [],
    /**
     * Контейнер окна достижения
     */
    container: new UI.Container(),
    /**
     * Время отображения уведомления на экране. Если больше 0, уменьшается каждый тик, до того момента пока не станет 0,
     * после этого гпи уведомления исчезает
     */
    delay: 0,

    /**
     * Добавление уведомления в очередь на показ
     * @param obj объект, описывающий уведомление
     */
    show: function (obj) {
        this.popupQueue.push(obj);
    },

    /**
     * Получение уведомления из очереди
     * @returns {*}
     */
    popQueue: function () {
        return this.popupQueue.pop();
    },

    /**
     * Технический метод инициализации гпи для всплывающий уведомлений
     */
    init: function () {
        this.popupUI = new UI.Window({
            location: {
                x: 700,
                y: 0,
                width: 300,
                height: 60
            },

            drawing: [
                {type: "color", color: Color.rgb(33, 33, 33)},
                {type: "frame", x: 0, y: 0, width: 1000, height: 200, bitmap: "frame_achievement", scale: 5}
            ],

            elements: {
                "title": {
                    type: "text",
                    text: "",
                    x: 190,
                    y: 30,
                    font: {color: Color.YELLOW, size: 50}
                },

                "description": {
                    type: "text",
                    text: "",
                    x: 190,
                    y: 100,
                    font: {color: Color.WHITE, size: 50}
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

        this.popupUI.setAsGameOverlay(true);
    }
};

AchievementPopup.init();

Callback.addCallback("tick", function () {
    if (!AchievementPopup.delay) {
        let popup = AchievementPopup.popQueue();

        if (popup) {
            let content = AchievementPopup.popupUI.getContent();
            let container = AchievementPopup.container;
            let elements = content.elements;
            let item = popup.item;
            let slot = container.getSlot("slot");

            elements.title.text = popup.title;
            elements.title.font.color = popup.color || Color.YELLOW;
            elements.description.text = popup.description;

            slot.id = item.id || 0;
            slot.data = item.data || 0;
            slot.count = item.count || 1;

            AchievementPopup.delay = popup.delay || 80;

            container.openAs(AchievementPopup.popupUI);
        }

        return;
    }

    if (--AchievementPopup.delay <= 0) {
        AchievementPopup.delay = 0;
        AchievementPopup.container.close();
    }
});
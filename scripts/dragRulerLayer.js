import { MODULE_ID } from "./const.js";
import { DragRuler } from "./dragRuler.js";

export class DragRulerLayer extends InteractionLayer {

    constructor() {
        super();

        this.rulers = this.addChild(new PIXI.Container());
        this.rulers.eventMode = "none";
    }

    _rulers = {};

    static get layerOptions() {
        return foundry.utils.mergeObject(super.layerOptions, {
            name: "dragRuler",
            zIndex: 1000
        });
    }

    get ruler() {
        return this.getRulerForUser(game.user.id);
    }

    getRulerForUser(userId) {
        return this._rulers[userId] || null;
    }

    async _draw(options) {
        await super._draw(options);

        // Create additional elements
        this.drawRulers();

        // Adjust scale
        const d = canvas.dimensions;
        this.hitArea = d.rect;
    }

    async _tearDown(options) {
        this._rulers = {};
        this.rulers.removeChildren();
    }

    drawRulers() {
        for (let u of game.users) {
            let ruler = this.getRulerForUser(u.id);
            if (!ruler) ruler = this._rulers[u.id] = new DragRuler(u);
            this.rulers.addChild(ruler);
        }
    }

    updateRuler(user, rulerData) {
        // Ignore rulers for users who are not permitted to share
        if ((user === game.user) || !user.hasPermission("SHOW_RULER")) return;

        // Update the Ruler display for the user
        const ruler = this.getRulerForUser(user.id);
        ruler?.update(rulerData);
    }
}
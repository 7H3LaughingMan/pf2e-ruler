import { MODULE_ID } from "./const.js";

export function registerKeybindings() {
    game.keybindings.register(MODULE_ID, "cancelDrag", {
        name: "pf2e-ruler.keybindings.cancelDrag",
        uneditable: [
            {
                key: "Escape"
            }
        ],
        onDown: cancelDrag,
        precedence: CONST.KEYBINDING_PRECEDENCE.PRIORITY
    });

    game.keybindings.register(MODULE_ID, "addWaypoint", {
        name: "pf2e-ruler.keybindings.addWaypoint",
        editable: [
            {
                key: "Space"
            }
        ],
        onDown: context => toggleTokenRulerWaypoint(context, true),
        precedence: CONST.KEYBINDING_PRECEDENCE.PRIORITY
    });

    game.keybindings.register(MODULE_ID, "removeWaypoint", {
        name: "pf2e-ruler.keybindings.removeWaypoint",
        onDown: context => toggleTokenRulerWaypoint(context, false),
        precedence: CONST.KEYBINDING_PRECEDENCE.PRIORITY
    });
}

function cancelDrag() {
    if (game.settings.get(MODULE_ID, "enableDragRuler") && canvas.dragRuler.ruler.state === Ruler.STATES.MEASURING) {
        const event = {
            preventDefaults: () => {
                return;
            }
        };

        const token = canvas.dragRuler.ruler.token;
        canvas.dragRuler.ruler._endMeasurement();

        token.mouseInteractionManager.cancel(event);
        token._onDragLeftCancel(event);
        return true;
    }

    return false;
};

let MOVE_TIME = 0;
function toggleTokenRulerWaypoint(context, add = true) {
    const ruler = canvas.dragRuler.ruler;
    if (!canvas.tokens.active || !ruler || !ruler.active) return;

    const now = Date.now();
    const delta = now - MOVE_TIME;
    if (delta < 100) return true;
    MOVE_TIME = now;

    if (add) ruler._addWaypoint(ruler.destination, { snap: false });
    else if (ruler.waypoints.length > 1) ruler._removeWaypoint();
}
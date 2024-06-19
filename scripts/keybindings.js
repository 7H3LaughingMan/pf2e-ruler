import { MODULE_ID } from "./const.js";

export function registerKeybindings() {
    game.keybindings.register(MODULE_ID, "cancelDrag", {
        name: "pf2e-ruler.keybindings.cancelDrag",
        uneditable: [
            {
                key: "Escape"
            }
        ],
        onDown: event => canvas.dragRuler.ruler.cancelDrag(),
        precedence: CONST.KEYBINDING_PRECEDENCE.PRIORITY
    });

    game.keybindings.register(MODULE_ID, "addWaypoint", {
        name: "pf2e-ruler.keybindings.addWaypoint",
        editable: [
            {
                key: "Space"
            }
        ],
        onDown: event => toggleTokenRulerWaypoint(event, true),
        precedence: CONST.KEYBINDING_PRECEDENCE.PRIORITY,
        reservedModifiers: ["Control", "Shift"]
    });

    game.keybindings.register(MODULE_ID, "removeWaypoint", {
        name: "pf2e-ruler.keybindings.removeWaypoint",
        onDown: event => toggleTokenRulerWaypoint(event, false),
        precedence: CONST.KEYBINDING_PRECEDENCE.PRIORITY
    });
}

let MOVE_TIME = 0;
function toggleTokenRulerWaypoint(event, add = true) {
    const ruler = canvas.dragRuler.ruler;
    if (!canvas.tokens.active || !ruler || !ruler.active) return false;

    const now = Date.now();
    const delta = now - MOVE_TIME;
    if (delta < 100) return false;
    MOVE_TIME = now;

    if (add) ruler._addWaypoint(ruler.destination, { snap: !event.isShift, teleport: event.isControl });
    else if (ruler.waypoints.length > 1) ruler._removeWaypoint();
    return true;
}
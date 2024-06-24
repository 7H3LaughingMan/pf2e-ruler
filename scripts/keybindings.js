import { MODULE_ID } from "./const.js";

export function registerKeybindings() {
    game.keybindings.register(MODULE_ID, "addWaypoint", {
        name: "pf2e-ruler.keybindings.addWaypoint",
        editable: [
            {
                key: "Equal"
            }
        ],
        onDown: context => toggleTokenRulerWaypoint(context, true),
        precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL
    });

    game.keybindings.register(MODULE_ID, "removeWaypoint", {
        name: "pf2e-ruler.keybindings.removeWaypoint",
        editable: [
            {
                key: "Minus"
            }
        ],
        onDown: context => toggleTokenRulerWaypoint(context, false),
        precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL
    });
}

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
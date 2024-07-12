import { MODULE_ID } from "./const.js";
import { registerSettings } from "./settings.js";
import { registerKeybindings } from "./keybindings.js";
import { wrapToken } from "./token.js";
import { DragRulerLayer } from "./dragRulerLayer.js";
import init, { SquareGrid, HexagonalGrid } from "../wasm/pf2e-astar.js";

Hooks.once("init", () => {
    CONFIG.Canvas.layers["dragRuler"] = {
        layerClass: DragRulerLayer,
        group: "interface"
    };

    registerSettings();
    registerKeybindings();
    wrapToken();

    init();

    window.dragRuler = {
        SquareGrid,
        HexagonalGrid
    };
});

Hooks.once("ready", () => {
    game.socket.on(`module.${MODULE_ID}`, (request, userId) => {
        const user = game.users.get(userId);
        if (!user || user.isSelf) return;

        if (!user.active || (user.viewedScene != canvas.id)) {
            canvas.dragRuler.getRulerForUser(userId).update(null);
            return;
        }

        switch (request.type) {
            case "RULER":
                canvas.dragRuler.getRulerForUser(userId).update(request.payload);
                break;
        }
    });
});

Hooks.on("getSceneControlButtons", function (controls) {
    const DRAGRULER_CONTROL = {
        name: "dragRuler",
        title: "pf2e-ruler.controls.dragRuler",
        icon: "fa-solid fa-compass-drafting",
        toggle: true,
        active: game.settings.get(MODULE_ID, "enableDragRuler"),
        onClick: active => {
            game.settings.set(MODULE_ID, "enableDragRuler", active);
        }
    };

    const PATHFINDING_CONTROL = {
        name: "pathfinding",
        title: "pf2e-ruler.controls.pathfinding",
        icon: "fa-solid fa-route",
        toggle: true,
        active: game.settings.get(MODULE_ID, "enablePathfinding"),
        onClick: active => {
            game.settings.set(MODULE_ID, "enablePathfinding", active);
        }
    };

    if (game.settings.get(MODULE_ID, "playerPathfinding") || game.user.isGM) {
        controls[0].tools.splice(3, 0, DRAGRULER_CONTROL, PATHFINDING_CONTROL);
    } else {
        controls[0].tools.splice(3, 0, DRAGRULER_CONTROL);
        game.settings.set(MODULE_ID, "enablePathfinding", false)
    }

});

Hooks.on("getCombatTrackerEntryContext", function (html, menu) {
    if (game.settings.get(MODULE_ID, "enableMovementHistory")) {
        const entry = {
            name: "pf2e-ruler.clearMovementHistory",
            icon: '<i class="fas fa-eraser"></i>',
            condition: li => {
                const combatant = game.combat.combatants.get(li.data("combatant-id"));
                return combatant?.getFlag(MODULE_ID, "movementHistory");
            },
            callback: li => {
                const combatant = game.combat.combatants.get(li.data("combatant-id"));
                if (combatant) combatant.unsetFlag(MODULE_ID, "movementHistory");
            }
        };
        menu.splice(1, 0, entry);
    }
});

Hooks.on("pf2e.startTurn", function (combatant, encounter, userId) {
    if (game.settings.get(MODULE_ID, "enableMovementHistory")) {
        combatant.unsetFlag(MODULE_ID, "movementHistory");
    }
});

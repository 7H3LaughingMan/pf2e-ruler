import { MODULE_ID } from "./const.js";
import { registerSettings } from "./settings.js";
import { registerKeybindings } from "./keybindings.js";
import { wrapToken } from "./token.js";
import { wrapRuler } from "./ruler.js";

Hooks.once("init", () => {
    registerSettings();
    registerKeybindings();
    wrapToken();
    wrapRuler();
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
              if ( combatant ) combatant.unsetFlag(MODULE_ID, "movementHistory");
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

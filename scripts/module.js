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
    const entry = {
        name: "pf2e-ruler.deleteMovementHistory",
        icon: '<i class="fas fa-eraser"></i>'
    };
    menu.splice(1, 0, entry);
});
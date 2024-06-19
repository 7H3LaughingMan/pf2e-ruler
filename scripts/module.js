import { registerSettings } from "./settings.js";
import { registerKeybindings } from "./keybindings.js";
import { wrapTokenDrag } from "./token.js";

Hooks.once("init", () => {
    registerSettings();
    registerKeybindings();
    wrapTokenDrag();
});
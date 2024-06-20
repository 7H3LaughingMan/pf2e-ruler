import { registerSettings } from "./settings.js";
import { registerKeybindings } from "./keybindings.js";
import { wrapTokenDrag } from "./token.js";
import { RulerPF2e } from "./ruler.js";

Hooks.once("init", () => {
    CONFIG.Canvas.rulerClass = RulerPF2e;

    registerSettings();
    registerKeybindings();
    wrapTokenDrag();
});
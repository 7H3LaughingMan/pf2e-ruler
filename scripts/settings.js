import { MODULE_ID } from "./const.js";

export function registerSettings() {
    game.settings.register(MODULE_ID, "singleAction", {
        name: "pf2e-ruler.settings.singleAction",
        scope: "client",
        config: true,
        type: new foundry.data.fields.ColorField(),
        default: "#3222C7"
    });

    game.settings.register(MODULE_ID, "doubleAction", {
        name: "pf2e-ruler.settings.doubleAction",
        scope: "client",
        config: true,
        type: new foundry.data.fields.ColorField(),
        default: "#FFEC07"
    });

    game.settings.register(MODULE_ID, "tripleAction", {
        name: "pf2e-ruler.settings.tripleAction",
        scope: "client",
        config: true,
        type: new foundry.data.fields.ColorField(),
        default: "#C033E0"
    });

    game.settings.register(MODULE_ID, "quadrupleAction", {
        name: "pf2e-ruler.settings.quadrupleAction",
        scope: "client",
        config: true,
        type: new foundry.data.fields.ColorField(),
        default: "#1BCAD8"
    });

    game.settings.register(MODULE_ID, "unreachable", {
        name: "pf2e-ruler.settings.unreachable",
        scope: "client",
        config: true,
        type: new foundry.data.fields.ColorField(),
        default: "#FF0000"
    });
}
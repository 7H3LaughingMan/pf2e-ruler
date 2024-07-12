import { MODULE_ID } from "./const.js";

export function registerSettings() {
    game.settings.register(MODULE_ID, "enableDragRuler", {
        scope: "client",
        config: false,
        type: Boolean,
        default: true
    });

    game.settings.register(MODULE_ID, "enablePathfinding", {
        scope: "client",
        config: false,
        type: Boolean,
        default: false
    });

    game.settings.register(MODULE_ID, "rightClickAction", {
        name: "pf2e-ruler.settings.rightClickAction.name",
        hint: "pf2e-ruler.settings.rightClickAction.hint",
        scope: "client",
        config: true,
        type: Number,
        default: 1,
        choices: {
            0: "pf2e-ruler.settings.rightClickAction.choices.add",
            1: "pf2e-ruler.settings.rightClickAction.choices.remove",
            2: "pf2e-ruler.settings.rightClickAction.choices.cancel"
        }
    });

    game.settings.register(MODULE_ID, "showPlayerSpeeds", {
        name: "pf2e-ruler.settings.showPlayerSpeeds.name",
        hint: "pf2e-ruler.settings.showPlayerSpeeds.hint",
        scope: "world",
        config: true,
        type: Boolean,
        default: true
    });

    game.settings.register(MODULE_ID, "playerPathfinding", {
        name: "pf2e-ruler.settings.playerPathfinding.name",
        hint: "pf2e-ruler.settings.playerPathfinding.hint",
        scope: "world",
        config: true,
        requiresReload: true,
        type: Boolean,
        default: true
    });

    game.settings.register(MODULE_ID, "showGMRuler", {
        name: "pf2e-ruler.settings.showGMRuler.name",
        hint: "pf2e-ruler.settings.showGMRuler.hint",
        scope: "world",
        config: true,
        type: Number,
        default: 2,
        choices: {
            0: "pf2e-ruler.settings.showGMRuler.choices.all",
            1: "pf2e-ruler.settings.showGMRuler.choices.neutral",
            2: "pf2e-ruler.settings.showGMRuler.choices.friendly",
            3: "pf2e-ruler.settings.showGMRuler.choices.none"
        }
    });

    game.settings.register(MODULE_ID, "enableMovementHistory", {
        name: "pf2e-ruler.settings.enableMovementHistory.name",
        hint: "pf2e-ruler.settings.enableMovementHistory.hint",
        scope: "world",
        config: true,
        requiresReload: true,
        type: Boolean,
        default: true
    });

    game.settings.register(MODULE_ID, "tokenHighlighting", {
        name: "pf2e-ruler.settings.tokenHighlighting.name",
        hint: "pf2e-ruler.settings.tokenHighlighting.hint",
        scope: "client",
        config: true,
        type: Number,
        default: 1,
        choices: {
            0: "pf2e-ruler.settings.tokenHighlighting.choices.never",
            1: "pf2e-ruler.settings.tokenHighlighting.choices.combat",
            2: "pf2e-ruler.settings.tokenHighlighting.choices.always"
        }
    });

    game.settings.register(MODULE_ID, "limitActions", {
        name: "pf2e-ruler.settings.limitActions.name",
        hint: "pf2e-ruler.settings.limitActions.hint",
        scope: "world",
        config: true,
        type: Boolean,
        default: true
    });

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
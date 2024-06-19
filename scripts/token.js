import { MODULE_ID } from "./const.js";
import { getActionCount } from "./actions.js";

export function wrapToken() {
    libWrapper.register(MODULE_ID, "Token.prototype._onDragLeftStart", onDragLeftStart, "WRAPPER");
    libWrapper.register(MODULE_ID, "Token.prototype._onDragLeftMove", onDragLeftMove, "WRAPPER");
    libWrapper.register(MODULE_ID, "Token.prototype._onDragLeftDrop", onDragLeftDrop, "MIXED");
    libWrapper.register(MODULE_ID, "Token.prototype._onDragLeftCancel", onDragLeftCancel, "MIXED");
}

const actionCategories = [
    {
        name: "singleAction",
        multiplier: 1
    },
    {
        name: "doubleAction",
        multiplier: 2
    },
    {
        name: "tripleAction",
        multiplier: 3
    },
    {
        name: "quadrupleAction",
        multiplier: 4
    }
];

const unreachableCategory = {
    name: "unreachable",
    multiplier: Number.POSITIVE_INFINITY
};

export function getTokenSpeed(token) {
    return token.actor.system.attributes.speed.total;
}

export function getTokenDistances(token) {
    const tokenActions = getActionCount(token);

    let tokenDistances = actionCategories.slice(0, tokenActions);
    tokenDistances.push(unreachableCategory);

    return tokenDistances;
}

function onDragLeftStart(wrapped, event) {
    wrapped(event);

    if (game.settings.get(MODULE_ID, "enableDragRuler") && canvas.dragRuler.ruler.state === Ruler.STATES.INACTIVE) {
        if (canvas.tokens.controlled.length == 1) {
            canvas.dragRuler.ruler._onDragLeftStart(event);
        }
    }
}

function onDragLeftMove(wrapped, event) {
    wrapped(event);

    if (game.settings.get(MODULE_ID, "enableDragRuler") && canvas.dragRuler.ruler.state === Ruler.STATES.MEASURING) {
        canvas.dragRuler.ruler._onDragLeftMove(event);
    }
}

async function onDragLeftDrop(wrapped, event) {
    if (game.settings.get(MODULE_ID, "enableDragRuler") && canvas.dragRuler.ruler.state === Ruler.STATES.MEASURING) {
        canvas.dragRuler.ruler._onDragLeftDrop(event);
    } else {
        wrapped(event);
    }
}

function onDragLeftCancel(wrapped, event) {
    if (game.settings.get(MODULE_ID, "enableDragRuler") && canvas.dragRuler.ruler.state === Ruler.STATES.MEASURING) {
        canvas.dragRuler.ruler._onDragLeftCancel(event);
    } else {
        wrapped(event);
    }
}
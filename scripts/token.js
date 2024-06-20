import { MODULE_ID } from "./const.js";

export function wrapToken() {
    libWrapper.register(MODULE_ID, "Token.prototype._onDragLeftStart", onDragLeftStart, "WRAPPER");
    libWrapper.register(MODULE_ID, "Token.prototype._onDragLeftMove", onDragLeftMove, "WRAPPER");
    libWrapper.register(MODULE_ID, "Token.prototype._onDragLeftDrop", onDragLeftDrop, "MIXED");
    libWrapper.register(MODULE_ID, "Token.prototype._onDragLeftCancel", onDragLeftCancel, "WRAPPER");
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
    let tokenDistances = [...actionCategories];
    tokenDistances.push(unreachableCategory);

    return tokenDistances;
}

function onDragLeftStart(wrapped, event) {
    wrapped(event);

    canvas.controls.ruler._onDragStart(event, { isTokenDrag: true });
}

function onDragLeftMove(wrapped, event) {
    wrapped(event);

    const ruler = canvas.controls.ruler;
    if (ruler._state > 0) ruler._onMouseMove(event);
}

async function onDragLeftDrop(wrapped, event) {
    const ruler = canvas.controls.ruler;
    if (!ruler.active) return wrapped(event);
    const destination = event.interactionData.destination;

    if (!canvas.dimensions.rect.contains(destination.x, destination.y)) {
        ruler._onMouseUp(event);
        return false;
    }

    ruler._onMoveKeyDown(event);
}

function onDragLeftCancel(wrapped, event) {
    wrapped(event);

    const ruler = canvas.controls.ruler;
    if (ruler._state !== Ruler.STATES.MOVING) ruler._onMouseUp(event);
}
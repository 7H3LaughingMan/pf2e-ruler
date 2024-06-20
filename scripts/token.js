import { MODULE_ID } from "./const.js";

export function wrapToken() {
    libWrapper.register(MODULE_ID, "Token.prototype._onDragLeftStart", onDragLeftStart, "WRAPPER");
    libWrapper.register(MODULE_ID, "Token.prototype._onDragLeftMove", onDragLeftMove, "WRAPPER");
    libWrapper.register(MODULE_ID, "Token.prototype._onDragLeftDrop", onDragLeftDrop, "MIXED");
    libWrapper.register(MODULE_ID, "Token.prototype._onDragLeftCancel", onDragLeftCancel, "WRAPPER");
}

export function getTokenDistances(token) {
    let tokenSpeed = token.actor.system.attributes.speed;

    return [
        {
            distance: tokenSpeed.total,
            color: Color.from("#3222C7")
        },
        {
            distance: tokenSpeed.total * 2,
            color: Color.from("#FFEC07")
        },
        {
            distance: tokenSpeed.total * 3,
            color: Color.from("#C033E0")
        },
        {
            distance: tokenSpeed.total * 4,
            color: Color.from("#1BCAD8")
        },
        {
            distance: Number.POSITIVE_INFINITY,
            color: Color.from("#FF0000")
        },
    ]
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
import { MODULE_ID } from "./const.js";

export function wrapTokenDrag() {
    libWrapper.register(MODULE_ID, "Token.prototype._onDragLeftStart", onDragLeftStart, "WRAPPER");
    libWrapper.register(MODULE_ID, "Token.prototype._onDragLeftMove", onDragLeftMove, "WRAPPER");
    libWrapper.register(MODULE_ID, "Token.prototype._onDragLeftDrop", onDragLeftDrop, "MIXED");
    libWrapper.register(MODULE_ID, "Token.prototype._onDragLeftCancel", onDragLeftCancel, "MIXED");
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
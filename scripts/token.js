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

export function compareTokenSpaces(oldTokenSpaces, newTokenSpaces) {
    const newSpaces = [];

    for (const newSpace of newTokenSpaces) {
        if (!oldTokenSpaces.some((oldSpace) => oldSpace.i == newSpace.i && oldSpace.j == newSpace.i)) {
            newSpaces.push(newSpace);
        }
    }

    return newSpaces;
}

export function getTokenSpaces(offset, tokenShape) {
    const tokenSpaces = [];

    for (const space of tokenShape.spaces) {
        tokenSpaces.push({ i: offset.i + space.i, j: offset.j + space.j });
    }

    return tokenSpaces;
};

export function getTokenShape(token) {
    const occupiedSpaces = getOccupiedSpaces(token);

    let centerPoint = token.getCenterPoint();
    let centerOffset = canvas.grid.getOffset(centerPoint);

    if (occupiedSpaces.length % 2 == 0) {
        const centerOffsets = occupiedSpaces.map((space) => {
            const centerSpace = canvas.grid.getCenterPoint(space);
            const distance = Math.hypot(centerPoint.x - centerSpace.x, centerPoint.y - centerSpace.y);
            return { i: space.i, j: space.j, distance };
        }).sort((a, b) => a.distance - b.distance).slice(0, ((canvas.grid.isSquare) ? 4 : 3));

        const topLeft = centerOffsets.map((space) => {
            const centerSpace = canvas.grid.getCenterPoint(space);
            const distance = Math.hypot(0 - centerSpace.x, 0 - centerSpace.y);
            return { i: space.i, j: space.j, distance };
        }).sort((a, b) => a.distance - b.distance)[0];

        centerPoint = canvas.grid.getCenterPoint(topLeft);
        centerOffset = { i: topLeft.i, j: topLeft.j };
    }

    return {
        centerOffset: { x: centerPoint.x - token.x, y: centerPoint.y - token.y },
        spaces: occupiedSpaces.map((space) => {
            return { i: space.i - centerOffset.i, j: space.j - centerOffset.j };
        })
    };
};

export function getOccupiedSpaces(token) {
    const grid = canvas.grid;
    const { x: ox, y: oy } = token.document;
    const shape = token.shape;
    const bounds = shape.getBounds();
    bounds.x += ox;
    bounds.y += oy;
    bounds.fit(canvas.dimensions.rect);

    // Identify grid space that have their center points covered by the template shape
    const positions = [];
    const [i0, j0, i1, j1] = grid.getOffsetRange(bounds);
    for (let i = i0; i < i1; i++) {
        for (let j = j0; j < j1; j++) {
            const offset = { i, j };
            const { x: cx, y: cy } = grid.getCenterPoint(offset);

            // If the origin of the template is a grid space center, this grid space is highlighted
            let covered = (Math.max(Math.abs(cx - ox), Math.abs(cy - oy)) < 1);
            if (!covered) {
                for (let dx = -0.5; dx <= 0.5; dx += 0.5) {
                    for (let dy = -0.5; dy <= 0.5; dy += 0.5) {
                        if (shape.contains(cx - ox + dx, cy - oy + dy)) {
                            covered = true;
                            break;
                        }
                    }
                }
            }
            if (!covered) continue;
            positions.push(offset);
        }
    }

    return positions;
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
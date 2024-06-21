import { MODULE_ID } from "./const.js";
import { getTokenDistances, getTokenSpeed } from "./token.js";

export function wrapRuler() {
    libWrapper.register(MODULE_ID, "Ruler.prototype._highlightMeasurementSegment", highlightMeasurementSegment, "MIXED");
    libWrapper.register(MODULE_ID, "Ruler.prototype._computeDistance", computeDistance, "MIXED");
    libWrapper.register(MODULE_ID, "Ruler.prototype.update", update, "MIXED");
    libWrapper.register(MODULE_ID, "Ruler.prototype._getMeasurementHistory", getMeasurementHistory, "MIXED");
    libWrapper.register(MODULE_ID, "Ruler.prototype._postMove", postMove, "MIXED");
    libWrapper.register(MODULE_ID, "Ruler.prototype._canMove", canMove, "MIXED");
}

function highlightMeasurementSegment(wrapped, segment) {
    if (segment.teleport) return;
    const token = this.token;

    // Make sure there is a token associated with this ruler for Token Speed Highlighting
    if (!token) {
        wrapped(segment);
    } else {
        // If Token Speed Highlighting is set to Never, then don't bother
        if (game.settings.get(MODULE_ID, "tokenHighlighting") == 0) {
            wrapped(segment);
            return;
        }

        // Verify that the user has Observer status of the token
        if (!token.document.testUserPermission(game.user, "OBSERVER")) {
            // If they don't, check to see if Show Player Speeds is enabled and the token is owned by the player
            if (!(token.document.hasPlayerOwner && game.settings.get(MODULE_ID, "showPlayerSpeeds"))) {
                wrapped(segment);
                return;
            }
        }

        // Check to see if Token Speed Highlighting is set to Combat Only
        if (game.settings.get(MODULE_ID, "tokenHighlighting") == 1) {
            // Check to see if the token is in combat and if the combat has started
            if (!token.document.inCombat && !game.combat?.started) {
                wrapped(segment);
                return;
            }
        }

        // Get the token's speed and the distances for each available action
        const tokenSpeed = getTokenSpeed(token);
        const tokenDistances = getTokenDistances(token);

        // Iterate through each square/hex on the grid
        for (const pathPoint of segment.directPath) {
            // Determine what color this square/hex should be based on the distance it took for the token to get here
            const tokenDistance = tokenDistances.find((x) => tokenSpeed * x.multiplier >= pathPoint.distance);
            const distanceColor = Color.from(game.settings.get(MODULE_ID, tokenDistance.name));

            // Highlight the square/hex
            const { x: x1, y: y1 } = canvas.grid.getTopLeftPoint(pathPoint);
            canvas.interface.grid.highlightPosition(this.name, { x: x1, y: y1, color: distanceColor });
        }
    }
}

function computeDistance(wrapped) {
    let path = [];
    if (this.segments.length) path.push(this.segments[0].ray.A);
    for (const segment of this.segments) {
        const { x, y } = segment.ray.B;
        path.push({ x, y, teleport: segment.teleport });
    }
    const directPath = canvas.grid.getDirectPath(path);
    const directPathCenters = Array.from(directPath, (x) => canvas.grid.getCenterPoint(x));

    const measurements = canvas.grid.measurePath(path, { cost: this._getCostFunction() });
    const directPathMeasurements = canvas.grid.measurePath(directPathCenters, { cost: this._getCostFunction() });

    let measuredPath = [];
    for (let i = 0; i < directPath.length; i++) {
        measuredPath.push({
            i: directPath[i].i,
            j: directPath[i].j,
            distance: directPathMeasurements.waypoints[i].distance,
            cost: directPathMeasurements.waypoints[i].cost
        })
    }

    this.totalDistance = 0;
    this.totalCost = 0;
    let pathIndex = 0
    for (let i = 0; i < this.segments.length; i++) {
        const segment = this.segments[i];
        const distance = measurements.segments[i].distance;
        const cost = measurements.segments[i].cost;
        this.totalDistance += distance;
        this.totalCost += cost;
        segment.distance = distance;
        segment.cost = cost;
        segment.cumulativeDistance = this.totalDistance;
        segment.cumulativeCost = this.totalCost;

        const spaces = measurements.segments[i].spaces;
        segment.directPath = measuredPath.slice(pathIndex, pathIndex + spaces + 1);
        pathIndex += spaces;
    }
}

const TOKEN_DISPOSITION = [-2, 0, 1, 2];
function update(wrapped, data) {
    if (!data)
        return wrapped(data);

    if (data.token && this.user.isGM && !game.user.isGM) {
        const token = canvas.tokens.get(data.token);
        const showGMRuler = game.settings.get(MODULE_ID, "showGMRuler");

        if (token.document.disposition < TOKEN_DISPOSITION[showGMRuler])
            return;
    }

    wrapped(data);
}

function getMeasurementHistory(wrapped) {
    const token = this.token;

    if (token && token.document.inCombat && game.combat.started && game.settings.get(MODULE_ID, "enableMovementHistory")) {
        return token.document.combatant.getFlag(MODULE_ID, "movementHistory");
    }
}

async function postMove(wrapped, token) {
    if (token.document.inCombat && game.combat.started && game.settings.get(MODULE_ID, "enableMovementHistory")) {
        token.document.combatant.setFlag(MODULE_ID, "movementHistory", this._createMeasurementHistory());
    }
}

function canMove(wrapped, token) {
    if (game.user.isGM)
        return true;

    return wrapped(token);
}
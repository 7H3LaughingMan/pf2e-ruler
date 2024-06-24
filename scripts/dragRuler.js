import { MODULE_ID } from "./const.js";
import { getTokenShape, getTokenDistances, getTokenSpeed } from "./token.js";

const TOKEN_DISPOSITION = [-2, 0, 1, 2];

export class DragRuler extends Ruler {

    constructor(user = game.user, { color } = {}) {
        super(user, { color });

        this.name = `DragRuler.${user.id}`;
    }

    get tokenShape() {
        return this.#tokenShape;
    }

    #tokenShape = null;

    _computeDistance() {
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

    _highlightMeasurementSegment(segment) {
        if (segment.teleport) return;
        const token = this.token;

        // Make sure there is a token associated with this ruler for Token Speed Highlighting
        if (!token) {
            super._highlightMeasurementSegment(segment);
        } else {
            // If Token Speed Highlighting is set to Never, then don't bother
            if (game.settings.get(MODULE_ID, "tokenHighlighting") == 0) {
                super._highlightMeasurementSegment(segment);
                return;
            }

            // Verify that the user has Observer status of the token
            if (!token.document.testUserPermission(game.user, "OBSERVER")) {
                // If they don't, check to see if Show Player Speeds is enabled and the token is owned by the player
                if (!(token.document.hasPlayerOwner && game.settings.get(MODULE_ID, "showPlayerSpeeds"))) {
                    super._highlightMeasurementSegment(segment);
                    return;
                }
            }

            // Check to see if Token Speed Highlighting is set to Combat Only
            if (game.settings.get(MODULE_ID, "tokenHighlighting") == 1) {
                // Check to see if the token is in combat and if the combat has started
                if (!token.document.inCombat && !game.combat?.started) {
                    super._highlightMeasurementSegment(segment);
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

    _getMeasurementHistory() {
        if (this.token && this.token.document.inCombat && game.combat.started && game.settings.get(MODULE_ID, "enableMovementHistory")) {
            return this.token.document.combatant.getFlag(MODULE_ID, "movementHistory");
        }
    }

    _canMove(token) {
        const canUpdate = token.document.canUserModify(game.user, "update");
        if (!canUpdate) throw new Error("RULER.MovementNoPermission");
        if (token.document.locked) throw new Error("RULER.MovementLocked");
        const hasCollision = this.segments.some(s => {
            return token.checkCollision(s.ray.B, { origin: s.ray.A, type: "move", mode: "any" });
        });
        if (hasCollision && !game.user.isGM) throw new Error("RULER.MovementCollision");
        return true;
    }

    async _postMove(token) {
        if (token.document.inCombat && game.combat.started && game.settings.get(MODULE_ID, "enableMovementHistory")) {
            token.document.combatant.setFlag(MODULE_ID, "movementHistory", this._createMeasurementHistory());
        }
    }

    #throttleBroadcastMeasurement = foundry.utils.throttle(this.#broadcastMeasurement.bind(this), 100);

    #broadcastMeasurement() {
        game.socket.emit(`module.${MODULE_ID}`, {
            type: "RULER",
            payload: this._getMeasurementData()
        });
    }

    _broadcastMeasurement() {
        if (!this.user.isSelf || !game.user.hasPermission("SHOW_RULER")) return;
        this.#throttleBroadcastMeasurement();
    }

    update(data) {
        if (!data || (data.state === Ruler.STATES.INACTIVE)) return this.clear();

        if (data.token && this.user.isGM && !game.user.isGM) {
            const token = canvas.tokens.get(data.token);
            const showGMRuler = game.settings.get(MODULE_ID, "showGMRuler");

            if (token.document.disposition < TOKEN_DISPOSITION[showGMRuler])
                return;
        }

        super.update(data);
    }

    cancelDrag() {
        if (game.settings.get(MODULE_ID, "enableDragRuler") && this.state === Ruler.STATES.MEASURING) {
            const event = {
                preventDefaults: () => {
                    return;
                }
            };

            const token = this.token;
            this._endMeasurement();

            token.mouseInteractionManager.cancel(event);
            token._onDragLeftCancel(event);

            return true;
        }

        return false;
    };

    _onDragLeftStart(event) {
        const token = event.interactionData.object;
        this.#tokenShape = getTokenShape(token);
        let { x, y } = token.getCenterPoint();

        if (!event.shiftKey) {
            x = token.x + this.tokenShape.centerOffset.x;
            y = token.y + this.tokenShape.centerOffset.y;
        }

        this._startMeasurement({ x, y }, { snap: !event.shiftKey, token: event.interactionData.object });
        if (this.token && (this.state === Ruler.STATES.MEASURING)) this.token.document.locked = true;
    }

    _onDragLeftMove(event) {
        const token = event.interactionData.clones[0];
        let { x, y } = token.getCenterPoint();

        if (!event.shiftKey) {
            x = token.document.x + this.tokenShape.centerOffset.x;
            y = token.document.y + this.tokenShape.centerOffset.y;
        }

        if (!canvas.dimensions.rect.contains(x, y)) return;
        this.measure({ x, y }, { snap: !event.shiftKey });
    }

    _onDragLeftDrop(event) {
        if (this.token) this.token.document.locked = this.token.document._source.locked;
        this.moveToken();
        if (this.state !== Ruler.STATES.MEASURING) canvas.mouseInteractionManager.cancel();
    }

    _onDragLeftCancel(event) {
        const rightClickAction = game.settings.get(MODULE_ID, "rightClickAction");

        switch (rightClickAction) {
            case 0:
                event.preventDefault();
                this._addWaypoint(this.destination, { snap: !event.shiftKey });
                break;
            case 1:
                event.preventDefault();
                if (this.waypoints.length > 1) this._removeWaypoint();
                break;
            case 2:
                this.cancelDrag();
                break;
        }
    }
}
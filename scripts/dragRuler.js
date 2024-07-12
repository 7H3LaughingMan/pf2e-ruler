import { MODULE_ID } from "./const.js";
import { getTokenDistances, getTokenSpeed } from "./token.js";
import { TokenShape } from "./tokenShape.js";
import { SquareGrid, HexagonalGrid } from "../wasm/pf2e-astar.js";

const TOKEN_DISPOSITION = [-2, 0, 1, 2];

export class DragRuler extends PIXI.Container {

    constructor(user = game.user, { color } = {}) {
        super();

        this.user = user;
        this.name = `DragRuler.${user.id}`;
        this.color = Color.from(color ?? this.user.color);
        this.ruler = this.addChild(new PIXI.Graphics());
        this.labels = this.addChild(new PIXI.Container());
    }

    static get STATES() {
        return Ruler.#STATES;
    }

    static #STATES = Object.freeze({
        INACTIVE: 0,
        STARTING: 1,
        MEASURING: 2,
        MOVING: 3
    });

    destination = null;

    get origin() {
        return this.waypoints.at(0) ?? null;
    }

    waypoints = [];

    segments = [];

    get history() {
        return this.#history;
    }

    #history = [];

    totalDiagonals = 0;

    totalDistance = 0;

    totalCost = 0;

    get state() {
        return this._state;
    }

    _state = Ruler.STATES.INACTIVE;

    get active() {
        return this.state !== Ruler.STATES.INACTIVE;
    }

    get highlightLayer() {
        return canvas.interface.grid.highlightLayers[this.name] || canvas.interface.grid.addHighlightLayer(this.name);
    }

    get token() {
        return this.#token;
    }

    #token = null;

    get tokenShape() {
        return this.#tokenShape;
    }

    #tokenShape = null;

    #grid = null;

    clear() {
        this._state = Ruler.STATES.INACTIVE;
        this.#token = null;
        this.#tokenShape = null;
        this.destination = null;
        this.waypoints = [];
        this.segments = [];
        this.#history = [];
        this.totalDiagonals = 0;
        this.totalDistance = 0;
        this.totalCost = 0;
        this.ruler.clear();
        this.labels.removeChildren().forEach(c => c.destroy());
        canvas.interface.grid.clearHighlightLayer(this.name);

        this.#grid = null;
    }

    measure(destination, { snap = true, force = false } = {}) {
        if (this.state !== Ruler.STATES.MEASURING) return;

        // Compute the measurement destination, segments, and distance
        const d = (force) ? destination : this._getMeasurement(destination, { snap });
        if (this.destination && (d.x === this.destination.x) && (d.y === this.destination.y) && !force) return;
        this.destination = d;

        if(force) {
            delete this.destination.path;
        }

        if (this.user === game.user && game.settings.get(MODULE_ID, "enablePathfinding")) {
            if (!force && this.#grid !== null) {
                const start = canvas.grid.getOffset(this.waypoints.at(-1));
                const end = canvas.grid.getOffset(this.destination);
                const path = this.#grid.find_path(start, end);

                if (path.length != 0) {
                    this.destination.path = path;
                }
            }
        }

        this.segments = this._getMeasurementSegments();
        this._computeDistance();
        this._broadcastMeasurement();

        // Draw the ruler graphic
        this.ruler.clear();
        this._drawMeasuredPath();

        // Draw grid highlight
        this.highlightLayer.clear();
        for (const segment of this.segments) this._highlightMeasurementSegment(segment);
        return this.segments;
    }

    _getMeasurement(point, { snap = true } = {}) {
        if (snap && !canvas.grid.isGridless) {
            const centerPoint = canvas.grid.getCenterPoint({
                x: point.x + this.tokenShape.snappedOffset.x,
                y: point.y + this.tokenShape.snappedOffset.y
            });

            return {
                x: centerPoint.x,
                y: centerPoint.y,
                snap
            };
        }

        return {
            x: point.x + this.tokenShape.centerPointOffset.x,
            y: point.y + this.tokenShape.centerPointOffset.y,
            snap
        }
    }

    _getMeasurementSegments() {
        const segments = [];
        const path = [];

        for (let element of this.history) {
            if (Object.hasOwn(element, "path")) {
                if (path.length == 0) {
                    path.push(...element.path);
                } else {
                    const pathAddition = element.path.slice(1);
                    path.push(...pathAddition);
                }
            } else {
                path.push(element);
            }
        }

        for (let element of this.waypoints) {
            if (Object.hasOwn(element, "path")) {
                if (path.length == 0) {
                    path.push(...element.path);
                } else {
                    const pathAddition = element.path.slice(1);
                    path.push(...pathAddition);
                }
            } else {
                path.push(element);
            }
        }

        if (Object.hasOwn(this.destination, "path")) {
            const pathAddition = this.destination.path.slice(1);
            path.push(...pathAddition);
        } else {
            path.push(this.destination);
        }

        for (let i = 1; i < path.length; i++) {
            const label = this.labels.children.at(i - 1) ?? this.labels.addChild(new PreciseText("", CONFIG.canvasTextStyle));
            const history = i < this.history.length;
            const first = i === this.history.length;
            const ray = new Ray(path[i - 1], path[i]);
            segments.push({
                ray,
                teleport: history ? path[i].teleport : first && (i > 0) && (ray.distance > 0),
                snap: path[i].snap ?? false,
                label,
                diagonals: 0,
                distance: 0,
                cost: 0,
                cumulativeDiagonals: 0,
                cumulativeDistance: 0,
                cumulativeCost: 0,
                history,
                first,
                last: i === path.length - 1,
                animation: {}
            });
        }
        if (this.labels.children.length > segments.length) {
            this.labels.removeChildren(segments.length).forEach(c => c.destroy());
        }
        return segments;
    }

    _startMeasurement(origin, { snap = true, token } = {}) {
        if (this.state !== Ruler.STATES.INACTIVE) return;
        this.clear();
        this._state = Ruler.STATES.STARTING;

        if (canvas.grid.isSquare) {
            this.#grid = new SquareGrid();
        }

        if (canvas.grid.isHexagonal) {
            this.#grid = new HexagonalGrid();
        }

        this.#token = token;
        this.#tokenShape = new TokenShape(token);
        this.#history = this._getMeasurementHistory() ?? [];
        this._addWaypoint(this._getMeasurement(origin, { snap }), { snap });
        canvas.hud.token.clear();
    }

    _endMeasurement() {
        if (this.state !== Ruler.STATES.MEASURING) return;
        this.clear();
        this._broadcastMeasurement();
    }

    _addWaypoint(point, { snap = true } = {}) {
        if ((this.state !== Ruler.STATES.STARTING) && (this.state !== Ruler.STATES.MEASURING)) return;
        const waypoint = {
            x: point.x,
            y: point.y,
            snap
        };

        if (this.user === game.user && game.settings.get(MODULE_ID, "enablePathfinding")) {
            if(this.waypoints.length > 0 && this.#grid !== null) {
                const start = canvas.grid.getOffset(this.waypoints.at(-1));
                const end = canvas.grid.getOffset(waypoint);
                const path = this.#grid.find_path(start, end);

                if (path && path.length >= 2) {
                    waypoint.path = path;
                }
            }
        }

        this.waypoints.push(waypoint);
        this._state = Ruler.STATES.MEASURING;
        this.measure(this.destination ?? point, { snap, force: true });
    }

    _removeWaypoint() {
        if ((this.state !== Ruler.STATES.STARTING) && (this.state !== Ruler.STATES.MEASURING)) return;
        if ((this.state === Ruler.STATES.MEASURING) && (this.waypoints.length > 1)) {
            this.waypoints.pop();
            this.measure(this.destination, { snap: false, force: true });
        }
        else this._endMeasurement();
    }

    _getCostFunction() { }

    _computeDirectPath(segment) {
        const path = canvas.grid.getDirectPath([segment.ray.A, segment.ray.B]);
        const costFn = this._getCostFunction();

        let o0 = path[0];
        let cumulativeDiagonals = segment.cumulativeDiagonals - segment.diagonals;
        let cumulativeCost = segment.cumulativeCost - segment.cost;
        o0.cost = cumulativeCost;

        for (let i = 1; i < path.length; i++) {
            const o1 = path[i];

            if (canvas.grid.isSquare) {
                let k;
                if ((o0.i === o1.i) || (o0.j === o1.j)) k = 1;
                else {
                    switch (canvas.grid.diagonals) {
                        case CONST.GRID_DIAGONALS.EQUIDISTANT: k = 1; break;
                        case CONST.GRID_DIAGONALS.EXACT: k = Math.SQRT2; break;
                        case CONST.GRID_DIAGONALS.APPROXIMATE: k = 1.5; break;
                        case CONST.GRID_DIAGONALS.RECTILINEAR: k = 2; break;
                        case CONST.GRID_DIAGONALS.ALTERNATING_1: k = cumulativeDiagonals & 1 ? 2 : 1; break;
                        case CONST.GRID_DIAGONALS.ALTERNATING_2: k = cumulativeDiagonals & 1 ? 1 : 2; break;
                    }
                    cumulativeDiagonals++;
                }

                cumulativeCost += costFn != null ? costFn(o0, o1, k * canvas.grid.distance) : k * canvas.grid.distance;
            }

            if (canvas.grid.isHexagonal) {
                cumulativeCost += costFn != null ? costFn(o0, o1, canvas.grid.distance) : canvas.grid.distance;
            }

            o1.cost = cumulativeCost;
            o0 = o1;
        }

        return path;
    }

    _computeDistance() {
        let path = [];
        if (this.segments.length) path.push(this.segments[0].ray.A);
        for (const segment of this.segments) {
            const { x, y } = segment.ray.B;
            path.push({ x, y, teleport: segment.teleport });
        }
        const measurements = canvas.grid.measurePath(path, { cost: this._getCostFunction() }).segments;
        this.totalDiagonals = 0;
        this.totalDistance = 0;
        this.totalCost = 0;
        for (let i = 0; i < this.segments.length; i++) {
            const segment = this.segments[i];
            const diagonals = measurements[i].diagonals ?? 0;
            const distance = measurements[i].distance;
            const cost = measurements[i].cost;
            this.totalDiagonals += diagonals;
            this.totalDistance += distance;
            this.totalCost += cost;
            segment.diagonals = diagonals;
            segment.distance = distance;
            segment.cost = cost;
            segment.cumulativeDiagonals = this.totalDiagonals;
            segment.cumulativeDistance = this.totalDistance;
            segment.cumulativeCost = this.totalCost;
        }
    }

    _getSegmentLabel(segment) {
        if (segment.teleport) return "";
        const units = canvas.grid.units;
        let label = `${Math.round(segment.cost * 100) / 100}`;
        if (units) label += ` ${units}`;
        if (segment.last) {
            label += ` [${Math.round(this.totalCost * 100) / 100}`;
            if (units) label += ` ${units}`;
            label += "]";
        }
        return label;
    }

    _drawMeasuredPath() {
        const paths = [];
        let path = null;
        for (const segment of this.segments) {
            const ray = segment.ray;
            if (ray.distance !== 0) {
                if (!path || (path.history !== segment.history)) {
                    path = { points: [ray.A], history: segment.history };
                    paths.push(path);
                }
                path.points.push(ray.B);
            }

            // Draw Label
            const label = segment.label;
            if (label) {
                const text = this._getSegmentLabel(segment);
                label.text = text;
                label.alpha = segment.last ? 1.0 : 0.5;
                label.visible = !!text && (ray.distance !== 0);
                label.anchor.set(0.5, 0.5);
                let { sizeX, sizeY } = canvas.grid;
                if (canvas.grid.isGridless) sizeX = sizeY = 6; // The radius of the waypoints
                const pad = 8;
                const offsetX = (label.width + (2 * pad) + sizeX) / Math.abs(2 * ray.dx);
                const offsetY = (label.height + (2 * pad) + sizeY) / Math.abs(2 * ray.dy);
                label.position = ray.project(1 + Math.min(offsetX, offsetY));
            }
        }
        const points = paths.map(p => p.points).flat();

        // Draw segments
        if (points.length === 1) {
            this.ruler.beginFill(0x000000, 0.5, true).drawCircle(points[0].x, points[0].y, 3).endFill();
            this.ruler.beginFill(this.color, 0.25, true).drawCircle(points[0].x, points[0].y, 2).endFill();
        } else {
            const dashShader = new PIXI.smooth.DashLineShader();
            for (const { points, history } of paths) {
                this.ruler.lineStyle({
                    width: 6, color: 0x000000, alpha: 0.5, shader: history ? dashShader : null,
                    join: PIXI.LINE_JOIN.ROUND, cap: PIXI.LINE_CAP.ROUND
                });
                this.ruler.drawPath(points);
                this.ruler.lineStyle({
                    width: 4, color: this.color, alpha: 0.25, shader: history ? dashShader : null,
                    join: PIXI.LINE_JOIN.ROUND, cap: PIXI.LINE_CAP.ROUND
                });
                this.ruler.drawPath(points);
            }
        }

        // Draw waypoints
        this.ruler.beginFill(this.color, 0.25, true).lineStyle(2, 0x000000, 0.5);
        for (const { x, y } of points) this.ruler.drawCircle(x, y, 6);
        this.ruler.endFill();
    }

    _highlightMeasurementSegment(segment) {
        if (segment.teleport) return;

        const token = this.token;
        const tokenSpeed = getTokenSpeed(token);
        const tokenDistances = getTokenDistances(token);
        const directPath = this._computeDirectPath(segment);

        let speedHighlight = true;

        if (game.settings.get(MODULE_ID, "tokenHighlighting") == 0) {
            speedHighlight = false;
        }

        if (!token.document.testUserPermission(game.user, "OBSERVER")) {
            if (!(token.document.hasPlayerOwner && game.settings.get(MODULE_ID, "showPlayerSpeeds"))) {
                speedHighlight = false;
            }
        }

        if (game.settings.get(MODULE_ID, "tokenHighlighting") == 1) {
            if (!token.document.inCombat && !game.combat?.started) {
                speedHighlight = false;
            }
        }

        for (const pathPoint of directPath) {
            const tokenDistance = tokenDistances.find((x) => tokenSpeed * x.multiplier >= pathPoint.cost);
            const distanceColor = ((speedHighlight) ? Color.from(game.settings.get(MODULE_ID, tokenDistance.name)) : this.color);

            const { x: x1, y: y1 } = canvas.grid.getTopLeftPoint(pathPoint);
            canvas.interface.grid.highlightPosition(this.name, { x: x1, y: y1, color: distanceColor });
        }
    }

    async moveToken({ playAnimation = true } = {}) {
        if (this.state !== Ruler.STATES.MEASURING) return false;
        if (game.paused && !game.user.isGM) {
            ui.notifications.warn("GAME.PausedWarning", { localize: true });
            return false;
        }

        // Get the Token which should move
        const token = this.token;
        if (!token) return false;

        // Verify whether the movement is allowed
        let error;
        try {
            if (!this._canMove(token)) error = "RULER.MovementNotAllowed";
        } catch (err) {
            error = err.message;
        }
        if (error) {
            ui.notifications.error(error, { localize: true });
            this.cancelDrag();
            return false;
        }

        // Animate the movement path defined by each ray segments
        this._state = Ruler.STATES.MOVING;
        await this._preMove(token);
        if (playAnimation) {
            await this._animateMovement(token);
        } else {
            const destination = this.segments.at(-1).ray.B;

            let dx = this.tokenShape.centerPointOffset.x;
            let dy = this.tokenShape.centerPointOffset.y;

            if (destination.snap && !canvas.grid.isGridless) {
                dx = this.tokenShape.snappedOffset.x;
                dy = this.tokenShape.snappedOffset.y;
            }

            const adjustedDestination = { x: Math.round(destination.x - dx), y: Math.round(destination.y - dy) };

            await token.document.update(adjustedDestination, { teleport: true });
        }
        await this._postMove(token);

        // Clear the Ruler
        this._state = Ruler.STATES.MEASURING;
        this._endMeasurement();
        return true;
    }

    _getMeasurementHistory() {
        if (this.token && this.token.document.inCombat && game.combat.started && game.settings.get(MODULE_ID, "enableMovementHistory")) {
            return this.token.document.combatant.getFlag(MODULE_ID, "movementHistory");
        }
    }

    _createMeasurementHistory() {
        if (!this.segments.length) return [];
        const origin = this.segments[0].ray.A;
        return this.segments.reduce((history, s) => {
            if (s.ray.distance === 0) return history;
            history.push({ x: s.ray.B.x, y: s.ray.B.y, teleport: s.teleport });
            return history;
        }, [{ x: origin.x, y: origin.y, teleport: false }]);
    }

    _canMove(token) {
        const canUpdate = token.document.canUserModify(game.user, "update");
        if (!canUpdate) throw new Error("RULER.MovementNoPermission");
        if (token.document.locked) throw new Error("RULER.MovementLocked");
        const hasCollision = this.segments.filter(s => !s.history).some(s => {
            return token.checkCollision(s.ray.B, { origin: s.ray.A, type: "move", mode: "any" });
        });
        if (hasCollision && !game.user.isGM) throw new Error("RULER.MovementCollision");
        return true;
    }

    async _animateMovement(token) {
        const wasPaused = game.paused;

        for (const segment of this.segments) {
            if (segment.history || (segment.ray.distance === 0)) continue;

            if (!wasPaused && game.paused) break;

            await this._animateSegment(token, segment);
        }
    }

    async _animateSegment(token, segment) {
        let name;
        if (segment.animation?.name === undefined) name = token.animationName;
        else name ||= Symbol(token.animationName);
        const { x, y } = token.document._source;

        let dx = this.tokenShape.centerPointOffset.x;
        let dy = this.tokenShape.centerPointOffset.y;

        if (segment.snap && !canvas.grid.isGridless) {
            dx = this.tokenShape.snappedOffset.x;
            dy = this.tokenShape.snappedOffset.y;
        }

        const adjustedDestination = { x: Math.round(segment.ray.B.x - dx), y: Math.round(segment.ray.B.y - dy) };

        await token.animate({ x, y }, { name, duration: 0 });
        await token.document.update(adjustedDestination, { teleport: segment.teleport, animation: { ...segment.animation, name } });
        await CanvasAnimation.getAnimation(name)?.promise;
    }

    async _preMove(token) { }

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

    _getMeasurementData() {
        return foundry.utils.deepClone({
            state: this.state,
            token: this.token?.id ?? null,
            tokenShape: this.tokenShape ?? null,
            history: this.history,
            waypoints: this.waypoints,
            destination: this.destination
        });
    }

    update(data) {
        if (!data || (data.state === Ruler.STATES.INACTIVE)) return this.clear();

        if (data.token && this.user.isGM && !game.user.isGM) {
            const token = canvas.tokens.get(data.token);
            const showGMRuler = game.settings.get(MODULE_ID, "showGMRuler");

            if (token.document.disposition < TOKEN_DISPOSITION[showGMRuler])
                return this.clear();
        }

        this._state = data.state;
        this.#token = canvas.tokens.get(data.token) ?? null;
        this.#tokenShape = data.tokenShape;
        this.#history = data.history;
        this.waypoints = data.waypoints;
        this.measure(data.destination, { snap: false, force: true });
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
        const { x, y } = token.document;

        this._startMeasurement({ x, y }, { snap: !event.shiftKey, token: token });
        if (this.token && (this.state === Ruler.STATES.MEASURING)) this.token.document.locked = true;
    }

    _onDragLeftMove(event) {
        const token = event.interactionData.clones[0];
        const { x, y } = token.document;

        if (!canvas.dimensions.rect.contains(x, y)) return;
        this.measure({ x, y }, { snap: !event.shiftKey });
    }

    _onDragLeftDrop(event) {
        if (this.token) this.token.document.locked = this.token.document._source.locked;
        this.moveToken({ playAnimation: !event.altKey });
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
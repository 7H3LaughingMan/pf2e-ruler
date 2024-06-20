import { MODULE_ID } from "./const.js";
import { getTokenDistances, getTokenSpeed } from "./token.js";

export function wrapRuler() {
    libWrapper.register(MODULE_ID, "Ruler.prototype._highlightMeasurementSegment", highlightMeasurementSegment, "MIXED");
    libWrapper.register(MODULE_ID, "Ruler.prototype._computeDistance", computeDistance, "MIXED");
}

function highlightMeasurementSegment(wrapped, segment) {
    if (segment.teleport) return;
    const token = this.token;

    if (!token) {
        wrapped(segment);
    } else {
        const tokenSpeed = getTokenSpeed(token);
        const tokenDistances = getTokenDistances(token);
        const startingDistance = segment.cumulativeDistance - segment.distance;

        for (const pathPoint of segment.directPath) {
            const pathDistance = startingDistance + pathPoint.distance;
            const tokenDistance = tokenDistances.find((x) => tokenSpeed * x.multiplier >= pathDistance);
            const distanceColor = Color.from(game.settings.get(MODULE_ID, tokenDistance.name));

            const { x: x1, y: y1 } = canvas.grid.getTopLeftPoint(pathPoint);
            canvas.interface.grid.highlightPosition(this.name, { x: x1, y: y1, color: distanceColor });
        }
    }
}

function computeDistance(wrapped) {
    this.totalDistance = 0;
    this.totalCost = 0;

    for (let i = 0; i < this.segments.length; i++) {
        const segment = this.segments[i];
        let directPath = canvas.grid.getDirectPath([segment.ray.A, segment.ray.B]);
        const measurements = canvas.grid.measurePath(Array.from(directPath, (x) => canvas.grid.getCenterPoint(x)), { cost: this._getCostFunction() });

        for (let j = 0; j < directPath.length; j++) {
            directPath[j].distance = measurements.waypoints[j].distance;
            directPath[j].cost = measurements.waypoints[j].cost;
        }

        const distance = measurements.distance;
        const cost = segment.history ? this.history[i + 1].cost : measurements.cost;
        this.totalDistance += distance;
        this.totalCost += cost;
        segment.distance = distance;
        segment.cost = cost;
        segment.cumulativeDistance = this.totalDistance;
        segment.cumulativeCost = this.totalCost;
        segment.directPath = directPath;
    }
}

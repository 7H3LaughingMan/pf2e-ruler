import { getTokenDistances } from "./token.js";

import(getTokenDistances)
export class RulerPF2e extends CONFIG.Canvas.rulerClass {
    _highlightMeasurementSegment(segment) {
        if (segment.teleport) return;
        const token = this.token;

        if (!token) {
            for (const pathPoint of segment.directPath) {
                const { x: x1, y: y1 } = canvas.grid.getTopLeftPoint(pathPoint);
                canvas.interface.grid.highlightPosition(this.name, { x: x1, y: y1, color: this.color });
            }
        } else {
            const distances = getTokenDistances(token);
            const startingDistance = segment.cumulativeDistance - segment.distance;

            for (const pathPoint of segment.directPath) {
                const pathDistance = startingDistance + pathPoint.distance;
                const distanceIndex = distances.findIndex((x) => x.distance >= pathDistance);

                const { x: x1, y: y1 } = canvas.grid.getTopLeftPoint(pathPoint);
                canvas.interface.grid.highlightPosition(this.name, { x: x1, y: y1, color: distances[distanceIndex].color });
            }
        }
    }

    _computeDistance() {
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
}
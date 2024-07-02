export class GridNode {
    constructor(coords) {
        this.offset = canvas.grid.getOffset(coords);
        this.centerPoint = canvas.grid.getCenterPoint(this.offset);

        this.diagonals = 0;

        this.f = 0;
        this.g = 0;
        this.h = 0;

        this.key = `[${this.offset.i},${this.offset.j}]`;
        this.valid = canvas.dimensions.sceneRect.contains(this.centerPoint.x, this.centerPoint.y);
        this.visited = false;
        this.closed = false;
        this.parent = null;
    }

    distanceTo(endNode) {
        var a = this.centerPoint.x - endNode.centerPoint.x;
        var b = this.centerPoint.y - endNode.centerPoint.y;

        return Math.hypot(a, b);
    }

    getCost(fromNeighbor) {
        if (canvas.grid.isSquare) {
            const k = ((fromNeighbor.offset.i == this.offset.i) || (fromNeighbor.offset.j == this.offset.j))
                ? 1
                : ((fromNeighbor.diagonals & 1) ? 2 : 1);
            return k * canvas.grid.distance;
        }

        return canvas.grid.distance;
    }

    visit(fromNeighbor, endNode) {
        this.visited = true;
        this.parent = fromNeighbor;
        this.h = (this.h !== 0) ? this.h : this.distanceTo(endNode);
        this.g = fromNeighbor.g + this.getCost(fromNeighbor);
        this.f = this.h + this.g;

        if (canvas.grid.isSquare) {
            this.diagonals = fromNeighbor.diagonals;

            if ((fromNeighbor.offset.i !== this.offset.i) && (fromNeighbor.offset.j !== this.offset.j)) {
                this.diagonals++;
            }
        }
    }

    checkCollision(fromNeighbor) {
        return CONFIG.Canvas.polygonBackends.move.testCollision(fromNeighbor.centerPoint, this.centerPoint, {
            mode: "any",
            type: "move"
        });
    }

    equals(other) {
        return (this.offset.i === other.offset.i) && (this.offset.j == other.offset.j);
    }
}
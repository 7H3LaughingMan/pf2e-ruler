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
            let k;
            if ((fromNeighbor.offset.i === this.offset.i) || (fromNeighbor.offset.j === this.offset.j)) k = 1;
            else {
                switch (canvas.grid.diagonals) {
                    case CONST.GRID_DIAGONALS.EQUIDISTANT: k = 1; break;
                    case CONST.GRID_DIAGONALS.EXACT: k = Math.SQRT2; break;
                    case CONST.GRID_DIAGONALS.APPROXIMATE: k = 1.5; break;
                    case CONST.GRID_DIAGONALS.RECTILINEAR: k = 2; break;
                    case CONST.GRID_DIAGONALS.ALTERNATING_1: k = fromNeighbor.diagonals & 1 ? 2 : 1; break;
                    case CONST.GRID_DIAGONALS.ALTERNATING_2: k = fromNeighbor.diagonals & 1 ? 1 : 2; break;
                }
            }

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
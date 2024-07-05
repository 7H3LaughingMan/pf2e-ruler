export class TokenShape {
    constructor(token) {
        this.occupiedSpaces = TokenShape.getOccupiedSpaces(token);

        const centerPoint = token.getCenterPoint();
        this.centerPointOffset = { x: centerPoint.x - token.document.x, y: centerPoint.y - token.document.y };

        if (this.occupiedSpaces.length == 0) {
            this.snappedOffset = this.centerPointOffset;
            return;
        }

        if (this.occupiedSpaces.length % ((canvas.grid.isSquare) ? 2 : 3) == 0) {
            const centerSpaces = this.occupiedSpaces.map((space) => {
                return {
                    x: space.x,
                    y: space.y,
                    distance: Math.hypot(this.centerPointOffset.x - space.x, this.centerPointOffset.y - space.y)
                };
            }).sort((a, b) => a.distance - b.distance).slice(0, ((canvas.grid.isSquare) ? 4 : 3));

            const topLeftCenterSpace = centerSpaces.map((space) => {
                return {
                    x: space.x,
                    y: space.y,
                    distance: Math.hypot(0 - space.x, 0 - space.y)
                };
            }).sort((a, b) => a.distance - b.distance)[0];

            this.snappedOffset = { x: topLeftCenterSpace.x, y: topLeftCenterSpace.y };
        } else {
            this.snappedOffset = this.centerPointOffset;
        }
    }

    static getOccupiedSpaces(token) {
        const grid = canvas.grid;
        const { x: ox, y: oy } = grid.getTopLeftPoint({ i: 1, j: 1 });
        const shape = token.shape;
        const bounds = shape.getBounds();
        bounds.x += ox;
        bounds.y += oy;

        const spaces = [];
        const [i0, j0, i1, j1] = grid.getOffsetRange(bounds);
        for (let i = i0; i < i1; i++) {
            for (let j = j0; j < j1; j++) {
                const offset = { i, j };
                const { x: cx, y: cy } = grid.getCenterPoint(offset);

                if (shape.contains(cx - ox, cy - oy)) {
                    spaces.push({
                        x: cx - ox, y: cy - oy
                    });
                }
            }
        }

        return spaces;
    }
}
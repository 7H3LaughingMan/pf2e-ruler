import { GridNode } from "./gridNode.js";

export class GridMap {
    constructor() {
        this.map = new Map();
    }

    get(offset) {
        let gridNode = this.map.get(`[${offset.i},${offset.j}]`);

        if(gridNode) {
            return gridNode;
        } else {
            gridNode = new GridNode(offset);

            if(gridNode.valid) {
                this.map.set(gridNode.key, gridNode);
                return gridNode;
            }
        }

        return null;
    }

    getNeighbors(offset) {
        return canvas.grid.getAdjacentOffsets(offset).map(offset => this.get(offset)).filter(node => node);
    }
}
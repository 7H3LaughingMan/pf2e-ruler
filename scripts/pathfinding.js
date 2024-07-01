import { BinaryHeap } from "./binaryHeap.js"
import { GridMap } from "./gridMap.js";

export function getAStarPath(start, end) {
    var gridMap = new GridMap();

    start = gridMap.get(start);
    end = gridMap.get(end);

    if (start === null || end === null)
        return [];

    var openHeap = new BinaryHeap((node) => node.f);
    openHeap.push(start);

    while (openHeap.size() > 0) {
        var currentNode = openHeap.pop();

        if (currentNode.equals(end)) {
            var path = [];
            while (currentNode.parent) {
                path.unshift(currentNode.centerPoint);
                currentNode = currentNode.parent;
            }
            return path;
        }

        currentNode.closed = true;
        var neighbors = gridMap.getNeighbors(currentNode.offset);

        for (var i = 0, il = neighbors.length; i < il; ++i) {
            var neighbor = neighbors[i];

            if (neighbor.closed || neighbor.checkCollision(currentNode)) {
                continue;
            }

            const gScore = currentNode.g + neighbor.getCost(currentNode);
            const beenVisited = neighbor.visited;

            if (!beenVisited || gScore < neighbor.g) {
                neighbor.visit(currentNode, end);

                if (!beenVisited) {
                    openHeap.push(neighbor);
                } else {
                    openHeap.rescoreElement(neighbor);
                }
            }
        }
    }

    return [];
}
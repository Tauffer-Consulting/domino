import { type Edge, isEdge, isNode, type Node } from "reactflow";

function convertToAdjacencyList(
  elements: Array<Edge | Node>,
): Record<string, string[]> {
  const adjacencyList: Record<string, string[]> = {};

  // Create an adjacency list from the given elements
  elements.forEach((element: Edge | Node) => {
    if (isNode(element)) {
      adjacencyList[element.id] = [];
    } else if (isEdge(element)) {
      if (!adjacencyList[element.source]) {
        adjacencyList[element.source] = [];
      }
      adjacencyList[element.source].push(element.target);
    }
  });

  return adjacencyList;
}

function hasCycle(adjacencyList: Record<string, string[]>): boolean {
  const visited: Record<string, boolean> = {};
  const recursionStack: Record<string, boolean> = {};

  // Helper function for DFS traversal
  function isNodeCyclic(nodeId: string): boolean {
    if (recursionStack[nodeId]) {
      return true; // Cycle detected
    }

    if (visited[nodeId]) {
      return false;
    }

    visited[nodeId] = true;
    recursionStack[nodeId] = true;

    const neighbors = adjacencyList[nodeId] || [];
    for (let i = 0; i < neighbors.length; i++) {
      if (isNodeCyclic(neighbors[i])) {
        return true; // Cycle detected in a neighbor
      }
    }
    recursionStack[nodeId] = false; // Backtrack
    return false;
  }

  // Perform DFS traversal for each node
  for (const node in adjacencyList) {
    if (isNodeCyclic(node)) {
      console.log("isNodeCyclic", node);
      return true; // Cycle detected on node
    }
  }
  return false;
}

export function isDag(nodes: Node[], edges: Edge[]): boolean {
  const adjacencyList = convertToAdjacencyList([...nodes, ...edges]);
  return !hasCycle(adjacencyList);
}

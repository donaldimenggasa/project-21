import { Node, Edge } from '@xyflow/react';
import { Logger } from './logger';

/**
 * Interface for layout options
 */
export interface LayoutOptions {
  direction?: 'LR' | 'RL' | 'TB' | 'BT';
  nodeWidth?: number;
  nodeHeight?: number;
  nodePaddingX?: number;
  nodePaddingY?: number;
  rankSeparation?: number;
  alignRanks?: boolean;
}

/**
 * Default layout options
 */
const DEFAULT_OPTIONS: LayoutOptions = {
  direction: 'LR', // Left to Right
  nodeWidth: 280,
  nodeHeight: 140,
  nodePaddingX: 50,
  nodePaddingY: 80,
  rankSeparation: 300,
  alignRanks: true,
};

/**
 * Interface for a node in the layout algorithm
 */
interface LayoutNode {
  id: string;
  rank: number;
  position: { x: number; y: number };
  width: number;
  height: number;
  children: string[];
  parents: string[];
}

/**
 * Automatically layout nodes in a workflow
 * @param nodes - The nodes to layout
 * @param edges - The edges connecting the nodes
 * @param options - Layout options
 * @returns The nodes with updated positions
 */
export function autoLayout(nodes: Node[], edges: Edge[], options: LayoutOptions = {}): Node[] {
  const logger = Logger.getInstance();
  
  try {
    // Merge options with defaults
    const opts = { ...DEFAULT_OPTIONS, ...options };
    
    // If there are no nodes, return empty array
    if (!nodes.length) {
      return [];
    }
    
    // Create a map of nodes for quick lookup
    const nodeMap: Record<string, LayoutNode> = {};
    
    // Initialize layout nodes
    nodes.forEach(node => {
      nodeMap[node.id] = {
        id: node.id,
        rank: 0, // Will be calculated
        position: node.position || { x: 0, y: 0 },
        width: node.width || opts.nodeWidth!,
        height: node.height || opts.nodeHeight!,
        children: [],
        parents: [],
      };
    });
    
    // Build the graph structure
    edges.forEach(edge => {
      if (nodeMap[edge.source] && nodeMap[edge.target]) {
        nodeMap[edge.source].children.push(edge.target);
        nodeMap[edge.target].parents.push(edge.source);
      }
    });
    
    // Find root nodes (nodes with no parents)
    const rootNodes = Object.values(nodeMap).filter(node => node.parents.length === 0);
    
    // If no root nodes, use the first node as root
    if (rootNodes.length === 0 && nodes.length > 0) {
      rootNodes.push(nodeMap[nodes[0].id]);
    }
    
    // Assign ranks to nodes (distance from root)
    const assignRanks = (nodeId: string, rank: number, visited: Set<string> = new Set()) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      
      const node = nodeMap[nodeId];
      node.rank = Math.max(node.rank, rank);
      
      node.children.forEach(childId => {
        assignRanks(childId, rank + 1, visited);
      });
    };
    
    // Assign ranks starting from each root node
    rootNodes.forEach(root => {
      assignRanks(root.id, 0);
    });
    
    // Group nodes by rank
    const rankGroups: Record<number, LayoutNode[]> = {};
    Object.values(nodeMap).forEach(node => {
      if (!rankGroups[node.rank]) {
        rankGroups[node.rank] = [];
      }
      rankGroups[node.rank].push(node);
    });
    
    // Sort ranks
    const sortedRanks = Object.keys(rankGroups).map(Number).sort((a, b) => a - b);
    
    // Position nodes by rank
    sortedRanks.forEach((rank, rankIndex) => {
      const nodesInRank = rankGroups[rank];
      
      // Sort nodes within rank by their connections
      nodesInRank.sort((a, b) => {
        // Try to keep nodes connected to the same parent close together
        const aParents = a.parents.map(p => nodeMap[p]?.rank || 0);
        const bParents = b.parents.map(p => nodeMap[p]?.rank || 0);
        
        const aAvgParentRank = aParents.length ? aParents.reduce((sum, r) => sum + r, 0) / aParents.length : 0;
        const bAvgParentRank = bParents.length ? bParents.reduce((sum, r) => sum + r, 0) / bParents.length : 0;
        
        return aAvgParentRank - bAvgParentRank;
      });
      
      // Calculate x position based on rank
      const x = rankIndex * opts.rankSeparation!;
      
      // Position nodes vertically within their rank
      nodesInRank.forEach((node, nodeIndex) => {
        const y = nodeIndex * (opts.nodeHeight! + opts.nodePaddingY!);
        node.position = { x, y };
      });
    });
    
    // If alignRanks is true, center nodes vertically within their rank
    if (opts.alignRanks) {
      sortedRanks.forEach(rank => {
        const nodesInRank = rankGroups[rank];
        const totalHeight = nodesInRank.length * opts.nodeHeight! + 
                           (nodesInRank.length - 1) * opts.nodePaddingY!;
        const startY = -totalHeight / 2;
        
        nodesInRank.forEach((node, index) => {
          node.position.y = startY + index * (opts.nodeHeight! + opts.nodePaddingY!);
        });
      });
    }
    
    // Create new nodes with updated positions
    const updatedNodes = nodes.map(node => {
      const layoutNode = nodeMap[node.id];
      return {
        ...node,
        position: layoutNode.position,
      };
    });
    
    logger.debug('Auto layout applied', { 
      nodeCount: nodes.length, 
      edgeCount: edges.length,
      rankCount: sortedRanks.length
    });
    
    return updatedNodes;
  } catch (error) {
    logger.error('Error in auto layout', error as Error);
    return nodes; // Return original nodes on error
  }
}

/**
 * Automatically layout nodes in a workflow with a horizontal distribution
 * This is a simpler version that just arranges nodes horizontally with equal spacing
 * @param nodes - The nodes to layout
 * @param edges - The edges connecting the nodes
 * @param startNodeId - The ID of the start node (optional)
 * @returns The nodes with updated positions
 */
export function autoLayoutHorizontal(nodes: Node[], edges: Edge[], startNodeId?: string): Node[] {
  const logger = Logger.getInstance();
  
  try {
    // If there are no nodes, return empty array
    if (!nodes.length) {
      return [];
    }
    
    // Create a map of nodes for quick lookup
    const nodeMap: Record<string, Node> = {};
    nodes.forEach(node => {
      nodeMap[node.id] = { ...node };
    });
    
    // Build adjacency list
    const adjacencyList: Record<string, string[]> = {};
    nodes.forEach(node => {
      adjacencyList[node.id] = [];
    });
    
    edges.forEach(edge => {
      if (adjacencyList[edge.source]) {
        adjacencyList[edge.source].push(edge.target);
      }
    });
    
    // Find the start node (either specified or first node with no incoming edges)
    let startNode: string | undefined = startNodeId;
    
    if (!startNode) {
      // Find nodes with no incoming edges
      const incomingEdges: Record<string, number> = {};
      nodes.forEach(node => {
        incomingEdges[node.id] = 0;
      });
      
      edges.forEach(edge => {
        if (incomingEdges[edge.target] !== undefined) {
          incomingEdges[edge.target]++;
        }
      });
      
      // Use the first node with no incoming edges as the start node
      startNode = Object.entries(incomingEdges)
        .find(([_, count]) => count === 0)?.[0];
      
      // If no start node found, use the first node
      if (!startNode && nodes.length > 0) {
        startNode = nodes[0].id;
      }
    }
    
    if (!startNode) {
      logger.warn('No start node found for auto layout');
      return nodes;
    }
    
    // Perform topological sort to determine node order
    const visited = new Set<string>();
    const nodeOrder: string[] = [];
    
    const visit = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      
      // Visit all children first
      adjacencyList[nodeId].forEach(childId => {
        visit(childId);
      });
      
      // Add this node to the order
      nodeOrder.unshift(nodeId);
    };
    
    // Start traversal from the start node
    visit(startNode);
    
    // Add any remaining nodes that weren't visited
    nodes.forEach(node => {
      if (!visited.has(node.id)) {
        nodeOrder.unshift(node.id);
      }
    });
    
    // Position nodes horizontally based on their order
    const HORIZONTAL_SPACING = 300; // Space between nodes
    const VERTICAL_POSITION = 100;  // Y position for all nodes
    
    // Create new nodes with updated positions
    const updatedNodes = nodes.map(node => {
      const orderIndex = nodeOrder.indexOf(node.id);
      const xPosition = orderIndex * HORIZONTAL_SPACING;
      
      return {
        ...node,
        position: {
          x: xPosition,
          y: VERTICAL_POSITION
        }
      };
    });
    
    logger.debug('Horizontal auto layout applied', { 
      nodeCount: nodes.length, 
      edgeCount: edges.length
    });
    
    return updatedNodes;
  } catch (error) {
    logger.error('Error in horizontal auto layout', error as Error);
    return nodes; // Return original nodes on error
  }
}
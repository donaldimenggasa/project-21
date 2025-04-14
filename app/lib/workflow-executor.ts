import { Logger } from './logger';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '~/store/zustand/store';
import { executeCode } from '~/lib/evaluate';


// Types for workflow execution
export interface WorkflowExecutionContext {
  workflowId: string;
  executionId: string;
  startTime: number;
  data: Record<string, any>;
  nodeResults: Record<string, any>;
  executedNodes: string[];
  currentNode?: string;
  errors: Record<string, Error>;
  parentWorkflowId?: string; // For tracking nested workflow executions
  parentNodeId?: string; // For tracking which node triggered this execution
  executionPath: string[]; // Track the path of execution to detect cycles
}

export interface NodeExecutionResult {
  success: boolean;
  data: any;
  error?: Error;
  nextNodes: string[];
}



export class WorkflowExecutor {
  private static instance: WorkflowExecutor;
  private logger = Logger.getInstance();
  private executionContexts: Record<string, WorkflowExecutionContext> = {};
  private MAX_EXECUTION_DEPTH = 10; 
  
 

  public static getInstance(): WorkflowExecutor {
    if (!WorkflowExecutor.instance) {
      WorkflowExecutor.instance = new WorkflowExecutor();
    }
    return WorkflowExecutor.instance;
  }
  
  private constructor() {}
 
  public async executeWorkflow(
    workflow: any,
    startNodeId: string,
    initialData: Record<string, any> = {}
  ): Promise<WorkflowExecutionContext> {
    const executionId = uuidv4();
    

    // Create execution context
    const context: WorkflowExecutionContext = {
      workflowId: workflow.id,
      executionId,
      startTime: Date.now(),
      data: { ...initialData },
      nodeResults: {},
      executedNodes: [],
      errors: {},
      parentWorkflowId: initialData.parentWorkflowId,
      parentNodeId: initialData.parentNodeId,
      executionPath: initialData.executionPath || []
    };
    
    context.executionPath.push(workflow.id);
    this.executionContexts[executionId] = context;
    
    try {
      const startNode = workflow.nodes.find((node: any) => node.id === startNodeId);
      if (!startNode) {
        throw new Error(`Start node ${startNodeId} not found`);
      }
      // Start execution from the start node
      await this.executeNode(workflow, startNode, context);
      return context;
    } catch (error) {
      this.logger.error('Error executing workflow', error as Error, { 
        workflowId: workflow.id, 
        executionId 
      });
      context.errors['workflow'] = error as Error;
      return context;
    }
  }
  
  
  private async executeNode(
    workflow: any,
    node: any,
    context: WorkflowExecutionContext
  ): Promise<NodeExecutionResult> {
    // Update context with current node
    context.currentNode = node.id;
    try {
      // Execute the node based on its type
      let result: NodeExecutionResult;
      switch (node.type) {
        case 'startNode':
          result = await this.executeStartNode(node, context);
          break;
        case 'javascriptNode':
          result = await this.executeJavaScriptNode(node, context);
          break;
        case 'httpNode':
          result = await this.executeHttpNode(node, context);
          break;
        case 'conditionNode':
          result = await this.executeConditionNode(node, context);
          break;
        case 'loopNode':
          result = await this.executeLoopNode(node, context);
          break;
        case 'intervalNode':
          result = await this.executeIntervalNode(node, context);
          break;
        case 'notificationNode':
          result = await this.executeNotificationNode(node, context);
          break;
        case 'fileNode':
          result = await this.executeFileNode(node, context);
          break;
        case 'executeWorkflowNode':
          result = await this.executeWorkflowNode(node, workflow, context);
          break;
        default:
          throw new Error(`Unsupported node type: ${node.type}`);
      }
      
      context.nodeResults[node.id] = result.data;
      context.executedNodes.push(node.id);
      // Find and execute next nodes
      const nextNodes = this.findNextNodes(workflow, node.id, result.nextNodes);
      for (const nextNode of nextNodes) {
        await this.executeNode(workflow, nextNode, context);
      }
      
      return result;
    } catch (error) {
      // Add error to context
      context.errors[node.id] = error as Error;
      return {
        success: false,
        data: null,
        error: error as Error,
        nextNodes: []
      };
    }
  }
  

  private findNextNodes(workflow: any, currentNodeId: string, specificTargets: string[] = []): any[] {
    if (specificTargets.length > 0) {
      return specificTargets.map(targetId => 
        workflow.nodes.find((node: any) => node.id === targetId)
      ).filter(Boolean);
    }
    // Otherwise, find nodes connected by edges
    const outgoingEdges = workflow.edges.filter((edge: any) => edge.source === currentNodeId);
    return outgoingEdges.map((edge: any) => 
      workflow.nodes.find((node: any) => node.id === edge.target)
    ).filter(Boolean);
  }
  


  private async executeStartNode(node: any, context: WorkflowExecutionContext): Promise<NodeExecutionResult> {
    return {
      success: true,
      data: {
        started: true,
        timestamp: Date.now()
      },
      nextNodes: []
    };
  }
  


  private async executeJavaScriptNode(node: any, context: WorkflowExecutionContext): Promise<NodeExecutionResult> {
    const code = node.data.code || 'return null;';

    const result = await executeCode(code, {
      workflow: { id: context.workflowId },
      data: context.data,
      results: context.nodeResults,
    });
    if (result.success) {
      // Update the context data with the result
      if (result.data && typeof result.data === 'object') {
        context.data = {
          ...context.data,
          ...result.data
        };
      }
    }
    return {
      success: result.success,
      data: result.data,
      error: result.success ? undefined : new Error(result.message),
      nextNodes: []
    };
  }
  


  private async executeHttpNode(node: any, context: WorkflowExecutionContext): Promise<NodeExecutionResult> {
    const { url, method, headers, body } = node.data;
    if (!url) {
      throw new Error('URL is required for HTTP node');
    }
    try {
      // Prepare request options
      const options: RequestInit = {
        method: method || 'GET',
        headers: headers || {},
      };
      
      // Add body for non-GET requests
      if (method !== 'GET' && body) {
        if (typeof body === 'object') {
          options.body = JSON.stringify(body);
          options.headers = {
            ...options.headers,
            'Content-Type': 'application/json'
          };
        } else {
          options.body = body;
        }
      }
      
      // Execute the request
      const response = await fetch(url, options);
      
      // Parse response based on content type
      let responseData;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }
      
      // Update context data
      context.data.httpResponse = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData
      };
      
      return {
        success: response.ok,
        data: {
          status: response.status,
          data: responseData
        },
        error: response.ok ? undefined : new Error(`HTTP request failed with status ${response.status}`),
        nextNodes: []
      };
    } catch (error) {
      throw new Error(`HTTP request failed: ${(error as Error).message}`);
    }
  }
  



  private async executeConditionNode(node: any, context: WorkflowExecutionContext): Promise<NodeExecutionResult> {
    const condition = node.data.condition || 'return true;';
    
    // Execute the condition code
    const result = await executeCode(condition, {
      workflow: { id: context.workflowId },
      data: context.data,
      results: context.nodeResults,
    });
    
    if (!result.success) {
      throw new Error(`Condition evaluation failed: ${result.message}`);
    }
    
    // Determine which path to take based on the condition result
    const conditionResult = !!result.data;
    
    // Find the appropriate edge based on the condition result
    // For condition nodes, we need to find edges with sourceHandle 'true' or 'false'
    const targetHandle = conditionResult ? 'true' : 'false';
    
    return {
      success: true,
      data: {
        condition: conditionResult,
        path: targetHandle
      },
      nextNodes: [targetHandle] // This will be used to find the correct edge
    };
  }
  




  private async executeLoopNode(node: any, context: WorkflowExecutionContext): Promise<NodeExecutionResult> {
    const { items, iterationCount } = node.data;
    
    // Determine what to iterate over
    let iterationItems: any[];
    
    if (items && Array.isArray(items)) {
      // Use provided items array
      iterationItems = items;
    } else if (iterationCount && typeof iterationCount === 'number') {
      // Create an array of the specified length
      iterationItems = Array.from({ length: iterationCount }, (_, i) => i);
    } else {
      // Default to a single iteration
      iterationItems = [0];
    }
    
    // Store results of each iteration
    const iterationResults = [];
    
    // Execute each iteration
    for (let i = 0; i < iterationItems.length; i++) {
      const item = iterationItems[i];
      
      // Update context with current iteration data
      context.data.currentIteration = {
        index: i,
        item,
        isFirst: i === 0,
        isLast: i === iterationItems.length - 1,
        total: iterationItems.length
      };
      
      // Store the result
      iterationResults.push({
        index: i,
        item,
        result: { executed: true }
      });
      
      // In a real implementation, we might execute child nodes for each iteration
      // For now, we just continue to the next node in the main flow
    }
    
    return {
      success: true,
      data: {
        iterations: iterationResults,
        count: iterationItems.length
      },
      nextNodes: []
    };
  }
  



  private async executeIntervalNode(node: any, context: WorkflowExecutionContext): Promise<NodeExecutionResult> {
    // For workflow execution, we just simulate a single execution of the interval
    // In a real implementation, this would set up an actual interval
    
    return {
      success: true,
      data: {
        executed: true,
        timestamp: Date.now()
      },
      nextNodes: []
    };
  }
  




  private async executeNotificationNode(node: any, context: WorkflowExecutionContext): Promise<NodeExecutionResult> {
    const { title, message, type } = node.data;
    
    // In a real implementation, this would show an actual notification
    // For now, we just log it
    this.logger.info('Notification', { title, message, type });
    
    return {
      success: true,
      data: {
        shown: true,
        title,
        message,
        type,
        timestamp: Date.now()
      },
      nextNodes: []
    };
  }
  
  /**
   * Execute a file node
   * @param node - The file node
   * @param context - The execution context
   * @returns The execution result
   */
  private async executeFileNode(node: any, context: WorkflowExecutionContext): Promise<NodeExecutionResult> {
    const { content, fileName, fileType } = node.data;
    
    if (!content || !fileName) {
      throw new Error('Content and filename are required for file node');
    }
    
    // In a real implementation, this would generate an actual file
    // For now, we just simulate it
    
    return {
      success: true,
      data: {
        generated: true,
        fileName,
        fileType,
        size: content.length,
        timestamp: Date.now()
      },
      nextNodes: []
    };
  }
  




  private async executeWorkflowNode(
    node: any, 
    parentWorkflow: any, 
    context: WorkflowExecutionContext
  ): Promise<NodeExecutionResult> {
    const { targetWorkflowId } = node.data;
    
    if (!targetWorkflowId) {
      throw new Error('Target workflow ID is required for Execute Workflow node');
    }
    
    // Check if this would create an infinite loop
    if (context.executionPath.includes(targetWorkflowId)) {
      throw new Error(`Infinite loop detected: workflow ${targetWorkflowId} is already in the execution path`);
    }
    
    // Check if we've exceeded the maximum execution depth
    if (context.executionPath.length >= this.MAX_EXECUTION_DEPTH) {
      throw new Error(`Maximum execution depth exceeded (${this.MAX_EXECUTION_DEPTH}). Possible infinite recursion.`);
    }
    
    // Get the target workflow using the Zustand store
    const state = useStore.getState();
    const targetWorkflow = state.workflow[targetWorkflowId];
    
    if (!targetWorkflow) {
      throw new Error(`Target workflow ${targetWorkflowId} not found`);
    }
    
    // Find the start node in the target workflow
    const startNode = targetWorkflow.nodes.find((n: any) => n.type === 'startNode');
    if (!startNode) {
      throw new Error(`Target workflow ${targetWorkflowId} has no start node`);
    }
    
    // Create a new execution context for the target workflow
    const targetContext = await this.executeWorkflow(
      targetWorkflow,
      startNode.id,
      {
        ...context.data,
        parentWorkflowId: context.workflowId,
        parentNodeId: node.id,
        executionPath: [...context.executionPath]
      }
    );
    
    // Check if there were any errors
    const hasErrors = Object.keys(targetContext.errors).length > 0;
    
    // Merge the results back into the parent context
    if (!hasErrors) {
      // Add the target workflow's results to the parent context
      Object.entries(targetContext.nodeResults).forEach(([nodeId, result]) => {
        context.nodeResults[`${targetWorkflowId}.${nodeId}`] = result;
      });
      
      // Update the parent context data with any new data from the target workflow
      context.data = {
        ...context.data,
        [targetWorkflowId]: targetContext.data
      };
    }
    
    return {
      success: !hasErrors,
      data: {
        executed: true,
        workflowId: targetWorkflowId,
        executionId: targetContext.executionId,
        duration: Date.now() - targetContext.startTime,
        nodeResults: targetContext.nodeResults,
        errors: targetContext.errors
      },
      error: hasErrors ? new Error('Error executing target workflow') : undefined,
      nextNodes: []
    };
  }
  




  public getExecutionContext(executionId: string): WorkflowExecutionContext | undefined {
    return this.executionContexts[executionId];
  }
  



  public getAllExecutionContexts(): Record<string, WorkflowExecutionContext> {
    return { ...this.executionContexts };
  }
  



  public clearExecutionContexts(): void {
    this.executionContexts = {};
  }
}



export const workflowExecutor = WorkflowExecutor.getInstance();
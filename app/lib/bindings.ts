import { getSelectorsInCode, executeCode, interpolateCode } from './evaluate';
import { Component } from '~/lib/types';

export interface Binding {
  sourceId: string;
  sourcePath: string[];
  targetId: string;
  targetPath: string[];
  expression: string;
}

export interface BindingMap {
  [componentId: string]: {
    [propertyPath: string]: Binding;
  };
}

export interface DependencyMap {
  [componentId: string]: Set<string>; // Set of component IDs that depend on this component
}

export class BindingManager {
  private bindings: BindingMap = {};
  private dependencies: DependencyMap = {};
  private components: Record<string, Component> = {};

  constructor(initialComponents: Record<string, Component> = {}) {
    this.components = initialComponents;
  }

  addBinding(binding: Binding): void {
    if (!this.bindings[binding.targetId]) {
      this.bindings[binding.targetId] = {};
    }
    
    const pathKey = binding.targetPath.join('.');
    this.bindings[binding.targetId][pathKey] = binding;

    // Update dependency graph
    if (!this.dependencies[binding.sourceId]) {
      this.dependencies[binding.sourceId] = new Set();
    }
    this.dependencies[binding.sourceId].add(binding.targetId);
  }

  removeBinding(targetId: string, targetPath: string[]): void {
    if (this.bindings[targetId]) {
      const pathKey = targetPath.join('.');
      const binding = this.bindings[targetId][pathKey];
      if (binding) {
        // Remove from dependency graph
        this.dependencies[binding.sourceId]?.delete(targetId);
        delete this.bindings[targetId][pathKey];
      }
    }
  }

  getAffectedComponents(sourceId: string): string[] {
    const affected = new Set<string>();
    const queue = [sourceId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const dependents = this.dependencies[currentId] || new Set();

      for (const dependentId of dependents) {
        if (!affected.has(dependentId)) {
          affected.add(dependentId);
          queue.push(dependentId);
        }
      }
    }

    return Array.from(affected);
  }

  evaluateBinding(binding: Binding): any {
    try {
      const scope = this.buildScope(binding.sourceId);
      const result = executeCode(binding.expression, scope);
      return result;
    } catch (error) {
      console.error('Error evaluating binding:', error);
      return null;
    }
  }

  private buildScope(sourceId: string): Record<string, any> {
    const scope: Record<string, any> = {};
    
    // Add source component and its properties to scope
    const sourceComponent = this.components[sourceId];
    if (sourceComponent) {
      scope[sourceId] = {
        ...sourceComponent.props,
        value: sourceComponent.value
      };
    }

    // Add referenced components to scope
    const selectors = getSelectorsInCode(sourceId);
    selectors.forEach(selector => {
      const componentId = selector[0];
      if (this.components[componentId]) {
        scope[componentId] = {
          ...this.components[componentId].props,
          value: this.components[componentId].value
        };
      }
    });

    return scope;
  }

  updateComponent(componentId: string, updates: Partial<Component>): void {
    // Update component
    this.components[componentId] = {
      ...this.components[componentId],
      ...updates
    };

    // Get affected components
    const affected = this.getAffectedComponents(componentId);

    // Re-evaluate bindings for affected components
    affected.forEach(targetId => {
      const componentBindings = this.bindings[targetId];
      if (componentBindings) {
        Object.values(componentBindings).forEach(binding => {
          const newValue = this.evaluateBinding(binding);
          // Update target component
          const targetComponent = this.components[binding.targetId];
          if (targetComponent) {
            let current = targetComponent.props;
            const lastKey = binding.targetPath[binding.targetPath.length - 1];
            
            // Navigate to the correct nested object
            for (let i = 0; i < binding.targetPath.length - 1; i++) {
              current = current[binding.targetPath[i]] = current[binding.targetPath[i]] || {};
            }
            
            // Update the value
            current[lastKey] = newValue;
          }
        });
      }
    });
  }

  parseBindingExpression(expression: string): Binding | null {
    try {
      // Extract source component and path from expression
      const matches = expression.match(/{{([\w.]+)}}/);
      if (!matches) return null;

      const [sourceId, ...sourcePath] = matches[1].split('.');
      
      return {
        sourceId,
        sourcePath,
        targetId: '', // To be filled by caller
        targetPath: [], // To be filled by caller
        expression: matches[1]
      };
    } catch (error) {
      console.error('Error parsing binding expression:', error);
      return null;
    }
  }
}
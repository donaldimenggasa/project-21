import React from 'react';
import { Database, Link as LinkIcon } from 'lucide-react';
import { useStore } from '~/store/zustand/store';
import { Component, ComponentConfig } from '~/lib/types';

interface BindingPropertiesProps {
  component: Component;
  config: ComponentConfig;
}

export const BindingProperties: React.FC<BindingPropertiesProps> = ({ component, config }) => {
  const { component: components, workflow: queries } = useStore();

  // State for binding configuration
  const [bindingType, setBindingType] = React.useState<'me' | 'query'>('me');
  const [bindingSource, setBindingSource] = React.useState<'query' | 'component'>('component');
  const [selectedQueryId, setSelectedQueryId] = React.useState('');
  const [selectedPath, setSelectedPath] = React.useState('');
  const [selectedComponentId, setSelectedComponentId] = React.useState('');
  const [selectedComponentPath, setSelectedComponentPath] = React.useState('');
  const [selectedTargetPath, setSelectedTargetPath] = React.useState('');

  const handleBindToQuery = () => {
    if (!selectedQueryId || !selectedPath || !selectedTargetPath) return;
    
    if (bindingType === 'me') {
      /*store.updateComponent(component.id, {
        ...component,
        bindings: {
          ...component.bindings,
          [selectedTargetPath]: `query.${selectedQueryId}.${selectedPath}`
        }
      });*/
    } else {
      /*store.updateComponent(component.id, {
        ...component,
        queryBindings: {
          targetQuery: selectedQueryId,
          targetPath: selectedPath
        }
      });*/
    }
  };

  const handleBindToComponent = () => {
    if (!selectedComponentId || !selectedComponentPath || !selectedTargetPath) return;
    
    /*store.updateComponent(component.id, {
      ...component,
      bindings: {
        ...component.bindings,
        [selectedTargetPath]: `component.${selectedComponentId}.${selectedComponentPath}`
      }
    });*/
  };

  // Get all available paths from queries
  const getQueryPaths = (data: any, prefix = ''): string[] => {
    if (!data || typeof data !== 'object') return [];
    
    return Object.entries(data).reduce((paths: string[], [key, value]) => {
      const currentPath = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null && !('sourceComponent' in value) && !('sourceQuery' in value)) {
        return [...paths, ...getQueryPaths(value, currentPath)];
      }
      
      return [...paths, currentPath];
    }, []);
  };

  // Get all available paths from a component
  const getComponentPaths = (comp: Component): string[] => {
    const paths: string[] = [];
    
    // Add direct value for input components
    if (comp.type === 'input') {
      paths.push('value');
    }
    
    // Add all props recursively
    const addPropPaths = (obj: any, prefix = '') => {
      if (!obj || typeof obj !== 'object') return;
      
      Object.entries(obj).forEach(([key, value]) => {
        const currentPath = prefix ? `${prefix}.${key}` : key;
        paths.push(currentPath);
        
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          addPropPaths(value, currentPath);
        }
      });
    };
    
    addPropPaths(comp.props);
    
    return paths.sort();
  };

  // Get bindable paths for the current component
  const getBindableTargetPaths = (): string[] => {
    const paths: string[] = [];
    console.log(config.props)
    
    // Get bindable properties from the component config
    Object.entries(config.props).forEach(([key, prop]) => {
      //if (prop.bindable) {
        paths.push(key);
     // }
    });
    
    return paths.sort();
  };

  // Reset dependent fields when binding type changes
  const handleBindingTypeChange = (type: 'me' | 'query') => {
    setBindingType(type);
    setSelectedQueryId('');
    setSelectedPath('');
    setSelectedComponentId('');
    setSelectedComponentPath('');
    setSelectedTargetPath('');
    setBindingSource('component');
  };

  // Reset path when source changes
  const handleBindingSourceChange = (source: 'query' | 'component') => {
    setBindingSource(source);
    setSelectedQueryId('');
    setSelectedPath('');
    setSelectedComponentId('');
    setSelectedComponentPath('');
    setSelectedTargetPath('');
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1 text-white">Binding Type</label>
        <select
          value={bindingType}
          onChange={(e) => handleBindingTypeChange(e.target.value as 'me' | 'query')}
          className={`w-full p-2 text-sm border rounded  bg-gray-800 border-gray-800`}
        >
          <option value="me">Update Me</option>
          <option value="query">Update Query</option>
        </select>
      </div>

      {bindingType === 'me' && (
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Binding Source</label>
          <select
            value={bindingSource}
            onChange={(e) => handleBindingSourceChange(e.target.value as 'query' | 'component')}
            className={`w-full p-2 text-sm border rounded  bg-gray-800 border-gray-800`}
          >
            <option value="component">From Component</option>
            <option value="query">From Query</option>
          </select>
        </div>
      )}

      {bindingType === 'me' && (
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">Bind To Property</label>
          <select
            value={selectedTargetPath}
            onChange={(e) => setSelectedTargetPath(e.target.value)}
            className={`w-full p-2 text-sm border rounded  bg-gray-800 border-gray-800`}
          >
            <option value="">Choose property to update...</option>
            {getBindableTargetPaths().map(path => (
              <option key={path} value={path}>{path}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};
import React, { useMemo } from 'react';
import { Component } from '~/lib/types';
import { cn } from '~/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area } from 'recharts';
import { useBoundValue } from '~/hooks/useBoundValue';
import { ComponentBuilder } from '~/components/Builder';
import { PropertyEditor } from '~/components/Builder/PropertyEditor';

interface EditorProps {
  'data-component-id': string;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

interface WidgetProps {
  component: Component;
  editorProps?: EditorProps;
}

export const linechartConfig = {
  type: 'linechart',
  props: {
    chartType: {
      order: 0,
      section: 'appearance',
      type: 'string',
      displayName: 'Chart Type',
      bindable: false,
      defaultValue: 'SimpleLineChart',
      value: null,
      bindValue: "",
      options: ['SimpleLineChart', 'StackedLineChart', 'AreaLineChart', 'StepLineChart']
    },
    dataSource: {
      order: 1,
      section: 'appearance',
      type: 'chartDatasourceEditor',
      displayName: 'Data Source',
      bindable: false,
      defaultValue: [
        { name: 'Jan', uv: 4000, pv: 2400, amt: 2400 },
        { name: 'Feb', uv: 3000, pv: 1398, amt: 2210 },
        { name: 'Mar', uv: 2000, pv: 9800, amt: 2290 },
        { name: 'Apr', uv: 2780, pv: 3908, amt: 2000 },
        { name: 'May', uv: 1890, pv: 4800, amt: 2181 },
        { name: 'Jun', uv: 2390, pv: 3800, amt: 2500 },
        { name: 'Jul', uv: 3490, pv: 4300, amt: 2100 },
      ],
      value: null,
      bindValue: "[]",
    },
    xAxisKey: {
      order: 2,
      section: 'appearance',
      type: 'string',
      displayName: 'X-Axis Key',
      bindable: false,
      defaultValue: 'name',
      value: null,
      bindValue: "",
    },
    lines: {
      order: 3,
      section: 'appearance',
      type: 'chartSeriesEditor',
      displayName: 'Line Configuration',
      bindable: false,
      defaultValue: [
        { 
          id: 'series1',
          dataKey: 'pv', 
          name: 'PV',
          stroke: "#8884d8", 
          fill: "#8884d8",
          type: "monotone",
          activeDot: { r: 8 },
          dot: true,
          strokeWidth: 2
        },
        { 
          id: 'series2',
          dataKey: 'uv', 
          name: 'UV',
          stroke: "#82ca9d", 
          fill: "#82ca9d",
          type: "monotone",
          activeDot: { r: 8 },
          dot: true,
          strokeWidth: 2
        }
      ],
      value: null,
      bindValue: "[]",
    },
    chartTitle: {
      order: 4,
      section: 'appearance',
      type: 'string',
      displayName: 'Chart Title',
      bindable: false,
      defaultValue: 'Line Chart',
      value: null,
      bindValue: "",
    },
    xAxisLabel: {
      order: 5,
      section: 'appearance',
      type: 'string',
      displayName: 'X-Axis Label',
      bindable: false,
      defaultValue: '',
      value: null,
      bindValue: "",
    },
    yAxisLabel: {
      order: 6,
      section: 'appearance',
      type: 'string',
      displayName: 'Y-Axis Label',
      bindable: false,
      defaultValue: '',
      value: null,
      bindValue: "",
    },
    showGrid: {
      order: 7,
      section: 'appearance',
      type: 'boolean',
      displayName: 'Show Grid',
      bindable: false,
      defaultValue: true,
      value: null,
      bindValue: "",
    },
    showLegend: {
      order: 8,
      section: 'appearance',
      type: 'boolean',
      displayName: 'Show Legend',
      bindable: false,
      defaultValue: true,
      value: null,
      bindValue: "",
    },
    showTooltip: {
      order: 9,
      section: 'appearance',
      type: 'boolean',
      displayName: 'Show Tooltip',
      bindable: false,
      defaultValue: true,
      value: null,
      bindValue: "",
    },
    showArea: {
      order: 10,
      section: 'appearance',
      type: 'boolean',
      displayName: 'Show Area',
      bindable: false,
      defaultValue: false,
      value: null,
      bindValue: "",
    },
    connectNulls: {
      order: 11,
      section: 'appearance',
      type: 'boolean',
      displayName: 'Connect Nulls',
      bindable: false,
      defaultValue: false,
      value: null,
      bindValue: "",
    },
    margin: {
      order: 12,
      section: 'appearance',
      type: 'object',
      displayName: 'Chart Margins',
      bindable: false,
      defaultValue: { top: 20, right: 30, left: 20, bottom: 20 },
      value: null,
      bindValue: "",
    },
    height: {
      order: 13,
      section: 'appearance',
      type: 'number',
      displayName: 'Chart Height',
      bindable: false,
      defaultValue: 300,
      value: null,
      bindValue: "",
    },
    className: {
      type: 'string',
      defaultValue: '',
      displayName: 'CSS Classes',
      section: 'style',
      bindable: false,
      order: 14,
    },
    style: {
      type: 'object',
      defaultValue: {},
      displayName: 'Inline Styles',
      section: 'style',
      bindable: false,
      order: 15,
    }
  },
  sections: {
    appearance: {
      name: 'Appearance',
      order: 1
    },
    style: {
      name: 'Style',
      order: 2
    }
  }
};

const componentRenderer: React.FC<WidgetProps> = React.memo(({ component, editorProps = {} }) => {
  const { props } = component;
  
  // Use useBoundValue for all props
  const chartType = useBoundValue(component.id, 'chartType');
  const dataSource = useBoundValue(component.id, 'dataSource');
  const xAxisKey = useBoundValue(component.id, 'xAxisKey');
  const lines = useBoundValue(component.id, 'lines');
  const chartTitle = useBoundValue(component.id, 'chartTitle');
  const xAxisLabel = useBoundValue(component.id, 'xAxisLabel');
  const yAxisLabel = useBoundValue(component.id, 'yAxisLabel');
  const showGrid = useBoundValue(component.id, 'showGrid');
  const showLegend = useBoundValue(component.id, 'showLegend');
  const showTooltip = useBoundValue(component.id, 'showTooltip');
  const showArea = useBoundValue(component.id, 'showArea');
  const connectNulls = useBoundValue(component.id, 'connectNulls');
  const margin = useBoundValue(component.id, 'margin');
  const height = useBoundValue(component.id, 'height');
  const className = useBoundValue(component.id, 'className');
  const style = useBoundValue(component.id, 'style');



  // Determine line type based on chart type
  const getLineType = useMemo(() => {
    switch (chartType) {
      case 'StepLineChart':
        return 'step';
      case 'SimpleLineChart':
        return 'linear';
      case 'StackedLineChart':
        return 'monotone';
      case 'AreaLineChart':
        return 'monotone';
      default:
        return 'monotone';
    }
  }, [chartType]);

  // Determine if we should show area
  const shouldShowArea = useMemo(() => {
    if (chartType === 'AreaLineChart') return true;
    return showArea ?? linechartConfig.props.showArea.defaultValue;
  }, [chartType, showArea]);

  // Determine if we should use stacked mode
  const isStacked = useMemo(() => {
    return chartType === 'StackedLineChart';
  }, [chartType]);

  const lineData = useMemo(() => {
    return Array.isArray(lines) ? lines : linechartConfig.props.lines.defaultValue;
  }, [lines]);

  return (
    <div 
      className={cn("w-full", className)} 
      style={{ height: `${height || linechartConfig.props.height.defaultValue}px`, ...style }} 
      {...editorProps}
    >
      {chartTitle && (
        <h3 className="text-center font-semibold mb-4 text-gray-700 dark:text-gray-300">
          {chartTitle}
        </h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={Array.isArray(dataSource) ? dataSource : linechartConfig.props.dataSource.defaultValue}
          margin={margin || linechartConfig.props.margin.defaultValue}
        >
          {(showGrid ?? linechartConfig.props.showGrid.defaultValue) && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis 
            dataKey={xAxisKey || linechartConfig.props.xAxisKey.defaultValue} 
            label={xAxisLabel ? { value: xAxisLabel, position: 'bottom' } : undefined}
          />
          <YAxis 
            label={yAxisLabel ? { 
              value: yAxisLabel, 
              angle: -90, 
              position: 'insideLeft' 
            } : undefined}
          />
          {(showTooltip ?? linechartConfig.props.showTooltip.defaultValue) && <Tooltip />}
          {(showLegend ?? linechartConfig.props.showLegend.defaultValue) && <Legend />}
          
          {lineData.map((line) => (
            shouldShowArea ? (
              <Area
                key={line.id}
                type={line.type || getLineType}
                dataKey={line.dataKey}
                name={line.name}
                stroke={line.stroke}
                fill={line.fill}
                strokeWidth={line.strokeWidth || 2}
                dot={line.dot !== false}
                activeDot={line.activeDot || { r: 8 }}
                connectNulls={connectNulls ?? linechartConfig.props.connectNulls.defaultValue}
                isAnimationActive={true}
                stackId={isStacked ? "stack1" : undefined}
              />
            ) : (
              <Line
                key={line.id}
                type={line.type || getLineType}
                dataKey={line.dataKey}
                name={line.name}
                stroke={line.stroke}
                fill="transparent"
                strokeWidth={line.strokeWidth || 2}
                dot={line.dot !== false}
                activeDot={line.activeDot || { r: 8 }}
                connectNulls={connectNulls ?? linechartConfig.props.connectNulls.defaultValue}
                isAnimationActive={true}
                stackId={isStacked ? "stack1" : undefined}
              />
            )
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

componentRenderer.displayName = 'LineChartRenderer';

export const linechartWidget = new ComponentBuilder()
  .setType(linechartConfig.type)
  .setDefaultProps(
    Object.entries(linechartConfig.props).reduce((props, [key, config]) => ({
      ...props,
      [key]: {
        value: null,
        bindValue: "",
        defaultValue: config.defaultValue
      }
    }), {})
  )
  .addPropertySection({
    name: linechartConfig.sections.appearance.name,
    view: (props) => <PropertyEditor {...props} config={linechartConfig} />
  })
  .addPropertySection({
    name: linechartConfig.sections.style.name,
    view: (props) => <PropertyEditor {...props} config={linechartConfig} />
  })
  .setRender(componentRenderer)
  .build();
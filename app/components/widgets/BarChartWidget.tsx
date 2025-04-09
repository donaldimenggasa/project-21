import React, { useMemo } from 'react';
import { Component } from '~/lib/types';
import { cn } from '~/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart, Bar } from 'recharts';
import { Rectangle } from 'recharts';
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

export const barchartConfig = {
  type: 'barchart',
  props: {
    chartType: {
      order: 0,
      section: 'appearance',
      type: 'string',
      displayName: 'Chart Type',
      bindable: false,
      defaultValue: 'SimpleBarChart',
      value: null,
      bindValue: "",
      options: ['SimpleBarChart', 'StackedBarChart', 'MixBarChart']
    },
    dataSource: {
      order: 1,
      section: 'appearance',
      type: 'chartDatasourceEditor',
      displayName: 'Data Source',
      bindable: false,
      defaultValue: [
        { name: 'Page A', uv: 4000, pv: 2400, amt: 2400 },
        { name: 'Page B', uv: 3000, pv: 1398, amt: 2210 },
        { name: 'Page C', uv: 2000, pv: 9800, amt: 2290 },
        { name: 'Page D', uv: 2780, pv: 3908, amt: 2000 },
        { name: 'Page E', uv: 1890, pv: 4800, amt: 2181 },
        { name: 'Page F', uv: 2390, pv: 3800, amt: 2500 },
        { name: 'Page G', uv: 3490, pv: 4300, amt: 2100 },
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
    bars: {
      order: 3,
      section: 'appearance',
      type: 'chartSeriesEditor',
      displayName: 'Bar Configuration',
      bindable: false,
      defaultValue: [
        { 
          id: 'series1',
          dataKey: 'pv', 
          name: 'PV',
          fill: "#8884d8", 
          activeBar: {fill: "#9c91eb", stroke: "#6c63b7"},
          stackId: "stack1"
        },
        { 
          id: 'series2',
          dataKey: 'uv', 
          name: 'UV',
          fill: "#82ca9d", 
          activeBar: {fill: "#a3e0b7", stroke: "#5fa77c"},
          stackId: "stack1"
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
      defaultValue: 'Bar Chart',
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
    stacked: {
      order: 10,
      section: 'appearance',
      type: 'boolean',
      displayName: 'Stacked Bars',
      bindable: false,
      defaultValue: false,
      value: null,
      bindValue: "",
    },
    margin: {
      order: 11,
      section: 'appearance',
      type: 'object',
      displayName: 'Chart Margins',
      bindable: false,
      defaultValue: { top: 20, right: 30, left: 20, bottom: 20 },
      value: null,
      bindValue: "",
    },
    height: {
      order: 12,
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
      order: 13,
    },
    style: {
      type: 'object',
      defaultValue: {},
      displayName: 'Inline Styles',
      section: 'style',
      bindable: false,
      order: 14,
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
  const chartType = useBoundValue(props.chartType) || barchartConfig.props.chartType.defaultValue;
  const dataSource = useBoundValue(props.dataSource);
  const xAxisKey = useBoundValue(props.xAxisKey);
  const bars = useBoundValue(props.bars);
  const chartTitle = useBoundValue(props.chartTitle);
  const xAxisLabel = useBoundValue(props.xAxisLabel);
  const yAxisLabel = useBoundValue(props.yAxisLabel);
  const showGrid = useBoundValue(props.showGrid);
  const showLegend = useBoundValue(props.showLegend);
  const showTooltip = useBoundValue(props.showTooltip);
  const stacked = useBoundValue(props.stacked);
  const margin = useBoundValue(props.margin);
  const height = useBoundValue(props.height);
  const className = useBoundValue(props.className);
  const style = useBoundValue(props.style);

  // Determine if we should use stacked mode based on chart type
  const useStackedMode = useMemo(() => {
    if (chartType === 'StackedBarChart') return true;
    if (chartType === 'SimpleBarChart') return false;
    // For MixBarChart, use the stacked prop
    return stacked ?? barchartConfig.props.stacked.defaultValue;
  }, [chartType, stacked]);

  return (
    <div 
      className={cn("w-full", className)} 
      style={{ height: `${height || barchartConfig.props.height.defaultValue}px`, ...style }} 
      {...editorProps}
    >
      {chartTitle && (
        <h3 className="text-center font-semibold mb-4 text-gray-700 dark:text-gray-300">
          {chartTitle}
        </h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={Array.isArray(dataSource) ? dataSource : barchartConfig.props.dataSource.defaultValue}
          margin={margin || barchartConfig.props.margin.defaultValue}
        >
          {(showGrid ?? barchartConfig.props.showGrid.defaultValue) && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis 
            dataKey={xAxisKey || barchartConfig.props.xAxisKey.defaultValue} 
            label={xAxisLabel ? { value: xAxisLabel, position: 'bottom' } : undefined}
          />
          <YAxis 
            label={yAxisLabel ? { 
              value: yAxisLabel, 
              angle: -90, 
              position: 'insideLeft' 
            } : undefined}
          />
          {(showTooltip ?? barchartConfig.props.showTooltip.defaultValue) && <Tooltip />}
          {(showLegend ?? barchartConfig.props.showLegend.defaultValue) && <Legend />}
          
          {Array.isArray(bars ? bars : barchartConfig.props.bars.defaultValue) && 
           (bars || barchartConfig.props.bars.defaultValue).map((bar, index) => (
            <Bar
              key={bar.id}
              dataKey={bar.dataKey}
              name={bar.name}
              fill={bar.fill}
              stackId={useStackedMode ? bar.stackId : undefined}
              activeBar={<Rectangle {...bar.activeBar} />}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

componentRenderer.displayName = 'BarChartRenderer';

export const barchartWidget = new ComponentBuilder()
  .setType(barchartConfig.type)
  .setDefaultProps(
    Object.entries(barchartConfig.props).reduce((props, [key, config]) => ({
      ...props,
      [key]: {
        value: null,
        bindValue: "",
        defaultValue: config.defaultValue
      }
    }), {})
  )
  .addPropertySection({
    name: barchartConfig.sections.appearance.name,
    view: (props) => <PropertyEditor {...props} config={barchartConfig} />
  })
  .addPropertySection({
    name: barchartConfig.sections.style.name,
    view: (props) => <PropertyEditor {...props} config={barchartConfig} />
  })
  .setRender(componentRenderer)
  .build();
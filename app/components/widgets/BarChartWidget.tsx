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
      section: 'basic',
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
      section: 'basic',
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
      bindValue: "{{ [] }}",
    },
    xAxisKey: {
      order: 2,
      section: 'basic',
      type: 'string',
      displayName: 'X-Axis Key',
      bindable: false,
      defaultValue: 'name',
      value: null,
      bindValue: "",
    },
    bars: {
      order: 3,
      section: 'basic',
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
      section: 'basic',
      type: 'string',
      displayName: 'Chart Title',
      bindable: false,
      defaultValue: 'Bar Chart',
      value: null,
      bindValue: "",
    },
    xAxisLabel: {
      order: 5,
      section: 'basic',
      type: 'string',
      displayName: 'X-Axis Label',
      bindable: false,
      defaultValue: '',
      value: null,
      bindValue: "",
    },
    yAxisLabel: {
      order: 6,
      section: 'basic',
      type: 'string',
      displayName: 'Y-Axis Label',
      bindable: false,
      defaultValue: '',
      value: null,
      bindValue: "",
    },
    showGrid: {
      order: 7,
      section: 'basic',
      type: 'boolean',
      displayName: 'Show Grid',
      bindable: false,
      defaultValue: true,
      value: null,
      bindValue: "",
    },
    showLegend: {
      order: 8,
      section: 'basic',
      type: 'boolean',
      displayName: 'Show Legend',
      bindable: false,
      defaultValue: true,
      value: null,
      bindValue: "",
    },
    showTooltip: {
      order: 9,
      section: 'basic',
      type: 'boolean',
      displayName: 'Show Tooltip',
      bindable: false,
      defaultValue: true,
      value: null,
      bindValue: "",
    },
    stacked: {
      order: 10,
      section: 'basic',
      type: 'boolean',
      displayName: 'Stacked Bars',
      bindable: false,
      defaultValue: false,
      value: null,
      bindValue: "",
    },
    margin: {
      order: 11,
      section: 'basic',
      type: 'object',
      displayName: 'Chart Margins',
      bindable: false,
      defaultValue: { top: 20, right: 30, left: 20, bottom: 20 },
      value: null,
      bindValue: "",
    },
    height: {
      order: 12,
      section: 'basic',
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
      section: 'basic',
      bindable: false,
      order: 13,
    },
    style: {
      type: 'object',
      defaultValue: {},
      displayName: 'Inline Styles',
      section: 'basic',
      bindable: false,
      order: 14,
    }
  },
  sections: {
    basic: {
      name: 'basic',
      order: 1
    }
  }
};

const componentRenderer: React.FC<WidgetProps> = React.memo(({ component, editorProps = {} }) => {
 

  const chartType = useBoundValue(component.id, 'chartType');
  const dataSource = useBoundValue(component.id, 'dataSource');
  const xAxisKey = useBoundValue(component.id, 'xAxisKey');
  const bars = useBoundValue(component.id, 'bars');
  const chartTitle = useBoundValue(component.id, 'chartTitle');
  const xAxisLabel = useBoundValue(component.id, 'xAxisLabel');
  const yAxisLabel = useBoundValue(component.id, 'yAxisLabel');
  const showGrid = useBoundValue(component.id, 'showGrid');
  const showLegend = useBoundValue(component.id, 'showLegend');
  const showTooltip = useBoundValue(component.id, 'showTooltip');
  const stacked = useBoundValue(component.id, 'stacked');
  const margin = useBoundValue(component.id, 'margin');
  const height = useBoundValue(component.id, 'height');
  const className = useBoundValue(component.id, 'className'); 
  const style = useBoundValue(component.id, 'style');

  



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
      {/*chartTitle && (
        <h3 className="text-center font-semibold mb-4 text-gray-700 dark:text-gray-300">
          {chartTitle}
        </h3>
      )*/}
      
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={Array.isArray(dataSource) ? dataSource : []}
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
    name: barchartConfig.sections.basic.name,
    view: (props) => <PropertyEditor {...props} config={barchartConfig} />
  })
  .setRender(componentRenderer)
  .build();
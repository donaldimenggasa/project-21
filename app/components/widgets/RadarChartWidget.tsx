import React, { useMemo } from 'react';
import { Component } from '~/lib/types';
import { cn } from '~/lib/utils';
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Legend, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useBoundValue } from '~/hooks/useBoundValue';
import { ComponentBuilder } from '~/components/Builder';
import { PropertyEditor } from '~/components/Builder/PropertyEditor';
import { c } from 'node_modules/vite/dist/node/moduleRunnerTransport.d-CXw_Ws6P';

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

export const radarchartConfig = {
  type: 'radarchart',
  props: {
    chartType: {
      order: 0,
      section: 'appearance',
      type: 'string',
      displayName: 'Chart Type',
      bindable: false,
      defaultValue: 'SimpleRadarChart',
      value: null,
      bindValue: "",
      options: ['SimpleRadarChart', 'FilledRadarChart', 'MultiRadarChart']
    },
    dataSource: {
      order: 1,
      section: 'appearance',
      type: 'chartDatasourceEditor',
      displayName: 'Data Source',
      bindable: false,
      defaultValue: [
        { subject: 'Math', A: 120, B: 110, fullMark: 150 },
        { subject: 'Chinese', A: 98, B: 130, fullMark: 150 },
        { subject: 'English', A: 86, B: 130, fullMark: 150 },
        { subject: 'Geography', A: 99, B: 100, fullMark: 150 },
        { subject: 'Physics', A: 85, B: 90, fullMark: 150 },
        { subject: 'History', A: 65, B: 85, fullMark: 150 },
      ],
      value: null,
      bindValue: "[]",
    },
    angleAxisKey: {
      order: 2,
      section: 'appearance',
      type: 'string',
      displayName: 'Angle Axis Key',
      bindable: false,
      defaultValue: 'subject',
      value: null,
      bindValue: "",
    },
    series: {
      order: 3,
      section: 'appearance',
      type: 'chartSeriesEditor',
      displayName: 'Radar Series',
      bindable: false,
      defaultValue: [
        { 
          id: 'series1',
          dataKey: 'A', 
          name: 'Mike',
          stroke: "#8884d8", 
          fill: "#8884d8",
          fillOpacity: 0.6,
          dot: true
        },
        { 
          id: 'series2',
          dataKey: 'B', 
          name: 'Lily',
          stroke: "#82ca9d", 
          fill: "#82ca9d",
          fillOpacity: 0.6,
          dot: true
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
      defaultValue: 'Radar Chart',
      value: null,
      bindValue: "",
    },
    showGrid: {
      order: 5,
      section: 'appearance',
      type: 'boolean',
      displayName: 'Show Grid',
      bindable: false,
      defaultValue: true,
      value: null,
      bindValue: "",
    },
    showPolarAxis: {
      order: 6,
      section: 'appearance',
      type: 'boolean',
      displayName: 'Show Polar Axis',
      bindable: false,
      defaultValue: true,
      value: null,
      bindValue: "",
    },
    showRadiusAxis: {
      order: 7,
      section: 'appearance',
      type: 'boolean',
      displayName: 'Show Radius Axis',
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
    gridConcentric: {
      order: 10,
      section: 'appearance',
      type: 'boolean',
      displayName: 'Concentric Grid',
      bindable: false,
      defaultValue: true,
      value: null,
      bindValue: "",
    },
    gridRadial: {
      order: 11,
      section: 'appearance',
      type: 'boolean',
      displayName: 'Radial Grid',
      bindable: false,
      defaultValue: true,
      value: null,
      bindValue: "",
    },
    outerRadius: {
      order: 12,
      section: 'appearance',
      type: 'string',
      displayName: 'Outer Radius',
      bindable: false,
      defaultValue: '80%',
      value: null,
      bindValue: "",
    },
    margin: {
      order: 13,
      section: 'appearance',
      type: 'object',
      displayName: 'Chart Margins',
      bindable: false,
      defaultValue: { top: 20, right: 30, left: 20, bottom: 20 },
      value: null,
      bindValue: "",
    },
    height: {
      order: 14,
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
      order: 15,
    },
    style: {
      type: 'object',
      defaultValue: {},
      displayName: 'Inline Styles',
      section: 'style',
      bindable: false,
      order: 16,
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

  const chartType = useBoundValue(component.id, 'chartType');
  const dataSource = useBoundValue(component.id, 'dataSource');
  const angleAxisKey = useBoundValue(component.id, 'angleAxisKey');
  const series = useBoundValue(component.id, 'series');
  const chartTitle = useBoundValue(component.id, 'chartTitle');
  const showGrid = useBoundValue(component.id, 'showGrid');
  const showPolarAxis = useBoundValue(component.id, 'showPolarAxis');
  const showRadiusAxis = useBoundValue(component.id, 'showRadiusAxis');
  const showLegend = useBoundValue(component.id, 'showLegend');
  const showTooltip = useBoundValue(component.id, 'showTooltip');
  const gridConcentric = useBoundValue(component.id, 'gridConcentric');
  const gridRadial = useBoundValue(component.id, 'gridRadial');
  const outerRadius = useBoundValue(component.id, 'outerRadius');
  const margin = useBoundValue(component.id, 'margin');
  const height = useBoundValue(component.id, 'height');
  const className = useBoundValue(component.id, 'className');
  const style = useBoundValue(component.id, 'style');


  
  // Determine if we should fill the radar based on chart type
  const shouldFill = useMemo(() => {
    return chartType === 'FilledRadarChart' || chartType === 'MultiRadarChart';
  }, [chartType]);

  // Determine fill opacity based on chart type
  const fillOpacity = useMemo(() => {
    if (chartType === 'SimpleRadarChart') return 0;
    if (chartType === 'FilledRadarChart') return 0.6;
    return 0.6; // MultiRadarChart
  }, [chartType]);

  // Prepare series data
  const seriesData = useMemo(() => {
    return Array.isArray(series) ? series : radarchartConfig.props.series.defaultValue;
  }, [series]);

  return (
    <div 
      className={cn("w-full", className)} 
      style={{ height: `${height || radarchartConfig.props.height.defaultValue}px`, ...style }} 
      {...editorProps}
    >
     
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart 
          outerRadius={outerRadius || radarchartConfig.props.outerRadius.defaultValue} 
          data={Array.isArray(dataSource) ? dataSource : radarchartConfig.props.dataSource.defaultValue}
          margin={margin || radarchartConfig.props.margin.defaultValue}
        >
          {(showGrid ?? radarchartConfig.props.showGrid.defaultValue) && (
            <PolarGrid 
              gridType={(gridConcentric ?? radarchartConfig.props.gridConcentric.defaultValue) ? 'circle' : 'polygon'}
              radialLines={gridRadial ?? radarchartConfig.props.gridRadial.defaultValue}
            />
          )}
          
          {(showPolarAxis ?? radarchartConfig.props.showPolarAxis.defaultValue) && (
            <PolarAngleAxis 
              dataKey={angleAxisKey || radarchartConfig.props.angleAxisKey.defaultValue} 
            />
          )}
          
          {(showRadiusAxis ?? radarchartConfig.props.showRadiusAxis.defaultValue) && (
            <PolarRadiusAxis />
          )}
          
          {seriesData.map((item) => (
            <Radar
              key={item.id}
              name={item.name}
              dataKey={item.dataKey}
              stroke={item.stroke}
              fill={item.fill}
              fillOpacity={shouldFill ? (item.fillOpacity || fillOpacity) : 0}
              dot={item.dot !== false}
            />
          ))}
          
          {(showLegend ?? radarchartConfig.props.showLegend.defaultValue) && <Legend />}
          {(showTooltip ?? radarchartConfig.props.showTooltip.defaultValue) && <Tooltip />}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
});

componentRenderer.displayName = 'RadarChartRenderer';

export const radarchartWidget = new ComponentBuilder()
  .setType(radarchartConfig.type)
  .setDefaultProps(
    Object.entries(radarchartConfig.props).reduce((props, [key, config]) => ({
      ...props,
      [key]: {
        value: null,
        bindValue: "",
        defaultValue: config.defaultValue
      }
    }), {})
  )
  .addPropertySection({
    name: radarchartConfig.sections.appearance.name,
    view: (props) => <PropertyEditor {...props} config={radarchartConfig} />
  })
  .addPropertySection({
    name: radarchartConfig.sections.style.name,
    view: (props) => <PropertyEditor {...props} config={radarchartConfig} />
  })
  .setRender(componentRenderer)
  .build();
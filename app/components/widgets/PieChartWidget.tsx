import React, { useMemo } from 'react';
import { Component } from '~/lib/types';
import { cn } from '~/lib/utils';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, Sector } from 'recharts';
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

export const piechartConfig = {
  type: 'piechart',
  props: {
    chartType: {
      order: 0,
      section: 'appearance',
      type: 'string',
      displayName: 'Chart Type',
      bindable: false,
      defaultValue: 'SimplePieChart',
      value: null,
      bindValue: "",
      options: ['SimplePieChart', 'DonutChart', 'NestedPieChart', 'ActiveShapePieChart']
    },
    dataSource: {
      order: 1,
      section: 'appearance',
      type: 'chartDatasourceEditor',
      displayName: 'Data Source',
      bindable: false,
      defaultValue: [
        { name: 'Group A', value: 400 },
        { name: 'Group B', value: 300 },
        { name: 'Group C', value: 300 },
        { name: 'Group D', value: 200 },
        { name: 'Group E', value: 100 },
      ],
      value: null,
      bindValue: "[]",
    },
    nameKey: {
      order: 2,
      section: 'appearance',
      type: 'string',
      displayName: 'Name Key',
      bindable: false,
      defaultValue: 'name',
      value: null,
      bindValue: "",
    },
    valueKey: {
      order: 3,
      section: 'appearance',
      type: 'string',
      displayName: 'Value Key',
      bindable: false,
      defaultValue: 'value',
      value: null,
      bindValue: "",
    },
    colorPalette: {
      order: 4,
      section: 'appearance',
      type: 'string',
      displayName: 'Color Palette',
      bindable: false,
      defaultValue: 'default',
      value: null,
      bindValue: "",
      options: ['default', 'pastel', 'cool', 'warm', 'neon', 'monochrome']
    },
    customColors: {
      order: 5,
      section: 'appearance',
      type: 'chartSeriesEditor',
      displayName: 'Custom Colors',
      bindable: false,
      defaultValue: [
        { id: 'color1', name: 'Group A', fill: '#0088FE' },
        { id: 'color2', name: 'Group B', fill: '#00C49F' },
        { id: 'color3', name: 'Group C', fill: '#FFBB28' },
        { id: 'color4', name: 'Group D', fill: '#FF8042' },
        { id: 'color5', name: 'Group E', fill: '#8884d8' }
      ],
      value: null,
      bindValue: "[]",
    },
    innerRadius: {
      order: 6,
      section: 'appearance',
      type: 'string',
      displayName: 'Inner Radius',
      bindable: false,
      defaultValue: '0%',
      value: null,
      bindValue: "",
    },
    outerRadius: {
      order: 7,
      section: 'appearance',
      type: 'string',
      displayName: 'Outer Radius',
      bindable: false,
      defaultValue: '80%',
      value: null,
      bindValue: "",
    },
    chartTitle: {
      order: 8,
      section: 'appearance',
      type: 'string',
      displayName: 'Chart Title',
      bindable: false,
      defaultValue: 'Pie Chart',
      value: null,
      bindValue: "",
    },
    showLegend: {
      order: 9,
      section: 'appearance',
      type: 'boolean',
      displayName: 'Show Legend',
      bindable: false,
      defaultValue: true,
      value: null,
      bindValue: "",
    },
    showTooltip: {
      order: 10,
      section: 'appearance',
      type: 'boolean',
      displayName: 'Show Tooltip',
      bindable: false,
      defaultValue: true,
      value: null,
      bindValue: "",
    },
    showLabels: {
      order: 11,
      section: 'appearance',
      type: 'boolean',
      displayName: 'Show Labels',
      bindable: false,
      defaultValue: false,
      value: null,
      bindValue: "",
    },
    labelPosition: {
      order: 12,
      section: 'appearance',
      type: 'string',
      displayName: 'Label Position',
      bindable: false,
      defaultValue: 'outside',
      value: null,
      bindValue: "",
      options: ['inside', 'outside']
    },
    startAngle: {
      order: 13,
      section: 'appearance',
      type: 'number',
      displayName: 'Start Angle',
      bindable: false,
      defaultValue: 0,
      value: null,
      bindValue: "",
    },
    endAngle: {
      order: 14,
      section: 'appearance',
      type: 'number',
      displayName: 'End Angle',
      bindable: false,
      defaultValue: 360,
      value: null,
      bindValue: "",
    },
    paddingAngle: {
      order: 15,
      section: 'appearance',
      type: 'number',
      displayName: 'Padding Angle',
      bindable: false,
      defaultValue: 0,
      value: null,
      bindValue: "",
    },
    margin: {
      order: 16,
      section: 'appearance',
      type: 'object',
      displayName: 'Chart Margins',
      bindable: false,
      defaultValue: { top: 20, right: 30, left: 20, bottom: 20 },
      value: null,
      bindValue: "",
    },
    height: {
      order: 17,
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
      order: 18,
    },
    style: {
      type: 'object',
      defaultValue: {},
      displayName: 'Inline Styles',
      section: 'style',
      bindable: false,
      order: 19,
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

// Color palettes
const COLOR_PALETTES = {
  default: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'],
  pastel: ['#FFB6C1', '#FFD700', '#98FB98', '#87CEFA', '#DDA0DD'],
  cool: ['#4169E1', '#00CED1', '#9370DB', '#48D1CC', '#5F9EA0'],
  warm: ['#FF6347', '#FF7F50', '#FFA07A', '#FF4500', '#FF8C00'],
  neon: ['#FF00FF', '#00FFFF', '#00FF00', '#FFFF00', '#FF0000'],
  monochrome: ['#2E4053', '#5D6D7E', '#85929E', '#ABB2B9', '#D5D8DC']
};

// Active shape renderer for ActiveShapePieChart
const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const { 
    cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent, value, name
  } = props;
  
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#999">
        {`${name}: ${value}`}
      </text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
        {`(${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

const componentRenderer: React.FC<WidgetProps> = React.memo(({ component, editorProps = {} }) => {
  const { props } = component;
  
  // Use useBoundValue for all props
  const chartType = useBoundValue(props.chartType) || piechartConfig.props.chartType.defaultValue;
  const dataSource = useBoundValue(props.dataSource);
  const nameKey = useBoundValue(props.nameKey);
  const valueKey = useBoundValue(props.valueKey);
  const colorPalette = useBoundValue(props.colorPalette);
  const customColors = useBoundValue(props.customColors);
  const innerRadius = useBoundValue(props.innerRadius);
  const outerRadius = useBoundValue(props.outerRadius);
  const chartTitle = useBoundValue(props.chartTitle);
  const showLegend = useBoundValue(props.showLegend);
  const showTooltip = useBoundValue(props.showTooltip);
  const showLabels = useBoundValue(props.showLabels);
  const labelPosition = useBoundValue(props.labelPosition);
  const startAngle = useBoundValue(props.startAngle);
  const endAngle = useBoundValue(props.endAngle);
  const paddingAngle = useBoundValue(props.paddingAngle);
  const margin = useBoundValue(props.margin);
  const height = useBoundValue(props.height);
  const className = useBoundValue(props.className);
  const style = useBoundValue(props.style);

  // Determine inner radius based on chart type
  const calculatedInnerRadius = useMemo(() => {
    if (chartType === 'DonutChart' || chartType === 'NestedPieChart') {
      return innerRadius || '60%';
    }
    if (chartType === 'SimplePieChart') {
      return 0;
    }
    return innerRadius || piechartConfig.props.innerRadius.defaultValue;
  }, [chartType, innerRadius]);

  // Get colors based on palette or custom colors
  const colors = useMemo(() => {
    if (Array.isArray(customColors) && customColors.length > 0) {
      return customColors.map(item => item.fill);
    }
    
    const palette = colorPalette || piechartConfig.props.colorPalette.defaultValue;
    return COLOR_PALETTES[palette] || COLOR_PALETTES.default;
  }, [colorPalette, customColors]);

  // Prepare data for the chart
  const chartData = useMemo(() => {
    return Array.isArray(dataSource) 
      ? dataSource 
      : piechartConfig.props.dataSource.defaultValue;
  }, [dataSource]);

  // For ActiveShapePieChart, we need to track the active index
  const [activeIndex, setActiveIndex] = React.useState(0);
  const onPieEnter = (_, index) => {
    if (chartType === 'ActiveShapePieChart') {
      setActiveIndex(index);
    }
  };

  // For NestedPieChart, we need two data sets
  const nestedData = useMemo(() => {
    if (chartType !== 'NestedPieChart') return null;
    
    // Create outer ring data
    const outerData = chartData.slice(0, Math.min(3, chartData.length));
    
    // Create inner ring data (remaining items or duplicated if not enough)
    const innerData = chartData.length > 3 
      ? chartData.slice(3) 
      : [...chartData].map(item => ({ 
          ...item, 
          name: `Sub-${item.name}`, 
          value: item.value * 0.6 
        }));
    
    return { outerData, innerData };
  }, [chartType, chartData]);

  return (
    <div 
      className={cn("w-full", className)} 
      style={{ height: `${height || piechartConfig.props.height.defaultValue}px`, ...style }} 
      {...editorProps}
    >
      {chartTitle && (
        <h3 className="text-center font-semibold mb-4 text-gray-700 dark:text-gray-300">
          {chartTitle}
        </h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={margin || piechartConfig.props.margin.defaultValue}>
          {chartType === 'NestedPieChart' && nestedData ? (
            <>
              <Pie
                data={nestedData.outerData}
                dataKey={valueKey || piechartConfig.props.valueKey.defaultValue}
                nameKey={nameKey || piechartConfig.props.nameKey.defaultValue}
                cx="50%"
                cy="50%"
                outerRadius={outerRadius || piechartConfig.props.outerRadius.defaultValue}
                innerRadius={calculatedInnerRadius}
                fill="#8884d8"
                paddingAngle={paddingAngle ?? piechartConfig.props.paddingAngle.defaultValue}
                startAngle={startAngle ?? piechartConfig.props.startAngle.defaultValue}
                endAngle={endAngle ?? piechartConfig.props.endAngle.defaultValue}
                label={showLabels && labelPosition === 'outside'}
                labelLine={showLabels && labelPosition === 'outside'}
              >
                {nestedData.outerData.map((entry, index) => (
                  <Cell key={`cell-outer-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Pie
                data={nestedData.innerData}
                dataKey={valueKey || piechartConfig.props.valueKey.defaultValue}
                nameKey={nameKey || piechartConfig.props.nameKey.defaultValue}
                cx="50%"
                cy="50%"
                innerRadius="0%"
                outerRadius={parseInt(calculatedInnerRadius) * 0.8 + '%'}
                fill="#8884d8"
                paddingAngle={paddingAngle ?? piechartConfig.props.paddingAngle.defaultValue}
                startAngle={startAngle ?? piechartConfig.props.startAngle.defaultValue}
                endAngle={endAngle ?? piechartConfig.props.endAngle.defaultValue}
                label={showLabels && labelPosition === 'inside'}
              >
                {nestedData.innerData.map((entry, index) => (
                  <Cell key={`cell-inner-${index}`} fill={colors[(index + 3) % colors.length]} />
                ))}
              </Pie>
            </>
          ) : chartType === 'ActiveShapePieChart' ? (
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={chartData}
              dataKey={valueKey || piechartConfig.props.valueKey.defaultValue}
              nameKey={nameKey || piechartConfig.props.nameKey.defaultValue}
              cx="50%"
              cy="50%"
              innerRadius={calculatedInnerRadius}
              outerRadius={outerRadius || piechartConfig.props.outerRadius.defaultValue}
              fill="#8884d8"
              paddingAngle={paddingAngle ?? piechartConfig.props.paddingAngle.defaultValue}
              startAngle={startAngle ?? piechartConfig.props.startAngle.defaultValue}
              endAngle={endAngle ?? piechartConfig.props.endAngle.defaultValue}
              onMouseEnter={onPieEnter}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
          ) : (
            <Pie
              data={chartData}
              dataKey={valueKey || piechartConfig.props.valueKey.defaultValue}
              nameKey={nameKey || piechartConfig.props.nameKey.defaultValue}
              cx="50%"
              cy="50%"
              innerRadius={calculatedInnerRadius}
              outerRadius={outerRadius || piechartConfig.props.outerRadius.defaultValue}
              fill="#8884d8"
              paddingAngle={paddingAngle ?? piechartConfig.props.paddingAngle.defaultValue}
              startAngle={startAngle ?? piechartConfig.props.startAngle.defaultValue}
              endAngle={endAngle ?? piechartConfig.props.endAngle.defaultValue}
              label={showLabels && (labelPosition === 'outside' ? true : { position: 'inside', fill: '#fff' })}
              labelLine={showLabels && labelPosition === 'outside'}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
          )}
          
          {(showTooltip ?? piechartConfig.props.showTooltip.defaultValue) && <Tooltip />}
          {(showLegend ?? piechartConfig.props.showLegend.defaultValue) && <Legend />}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
});

componentRenderer.displayName = 'PieChartRenderer';

export const piechartWidget = new ComponentBuilder()
  .setType(piechartConfig.type)
  .setDefaultProps(
    Object.entries(piechartConfig.props).reduce((props, [key, config]) => ({
      ...props,
      [key]: {
        value: null,
        bindValue: "",
        defaultValue: config.defaultValue
      }
    }), {})
  )
  .addPropertySection({
    name: piechartConfig.sections.appearance.name,
    view: (props) => <PropertyEditor {...props} config={piechartConfig} />
  })
  .addPropertySection({
    name: piechartConfig.sections.style.name,
    view: (props) => <PropertyEditor {...props} config={piechartConfig} />
  })
  .setRender(componentRenderer)
  .build();
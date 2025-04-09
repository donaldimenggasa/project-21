import React, { useMemo } from 'react';
import { Component } from '~/lib/types';
import { cn } from '~/lib/utils';
import ReactECharts from 'echarts-for-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart, Bar } from 'recharts';
import { Rectangle } from 'recharts';


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

export const chartConfig = {
  type: 'chart',
  props: {
    title: {
      type: 'string',
      defaultValue: 'Chart Title',
      displayName: 'Title',
      section: 'basic',
      bindable: true
    },
    labels: {
      order: 2000,
      section: 'data',
      type: 'array',
      displayName: 'Labels',
      bindable: false,
      defaultValue: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      value : null,
      bindValue:"[]",
    },
    values: {
      type: 'array', 
      defaultValue: [140, 232, 101, 264, 90, 340, 250, 380, 420, 530, 610, 720],
      displayName: 'Values',
      section: 'data',
      bindable: true
    },
    min: {
      type: 'number',
      defaultValue: 0,
      displayName: 'Min Value',
      section: 'data',
      bindable: true
    },
    max: {
      type: 'number',
      defaultValue: 1000,
      displayName: 'Max Value', 
      section: 'data',
      bindable: true
    },
    seriesName: {
      type: 'string',
      defaultValue: 'Value',
      displayName: 'Series Name',
      section: 'data',
      bindable: true
    },
    valuePrefix: {
      type: 'string',
      defaultValue: '$',
      displayName: 'Value Prefix',
      section: 'data',
      bindable: true
    },
    valueSuffix: {
      type: 'string',
      defaultValue: '',
      displayName: 'Value Suffix',
      section: 'data',
      bindable: true
    },
    gradientFrom: {
      type: 'string',
      defaultValue: 'rgb(59, 130, 246)',
      displayName: 'Gradient Start Color',
      section: 'style',
      bindable: true
    },
    gradientTo: {
      type: 'string',
      defaultValue: 'rgb(219, 234, 254)',
      displayName: 'Gradient End Color',
      section: 'style',
      bindable: true
    },
    period: {
      type: 'array',
      defaultValue: ['1Y', '5Y', '10Y', 'Max'],
      displayName: 'Time Periods',
      section: 'basic',
      bindable: true
    },
    activePeriod: {
      type: 'string',
      defaultValue: '1Y',
      displayName: 'Active Period',
      section: 'basic',
      bindable: true
    },
    description: {
      type: 'string',
      defaultValue: '',
      displayName: 'Description',
      section: 'basic',
      bindable: true
    },
    className: {
      type: 'string',
      defaultValue: '',
      displayName: 'CSS Classes',
      section: 'style',
      bindable: true
    },
    style: {
      type: 'object',
      defaultValue: {},
      displayName: 'Inline Styles',
      section: 'style',
      bindable: true
    }
  },
  sections: {
    basic: {
      name: 'Basic',
      order: 0
    },
    data: {
      name: 'Data',
      order: 1
    },
    style: {
      name: 'Style',
      order: 2
    }
  }
};


const data = [
  {
    name: 'Page A',
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    name: 'Page B',
    uv: 3000,
    pv: 1398,
    amt: 2210,
  },
  {
    name: 'Page C',
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    name: 'Page D',
    uv: 2780,
    pv: 3908,
    amt: 2000,
  },
  {
    name: 'Page E',
    uv: 1890,
    pv: 4800,
    amt: 2181,
  },
  {
    name: 'Page F',
    uv: 2390,
    pv: 3800,
    amt: 2500,
  },
  {
    name: 'Page G',
    uv: 3490,
    pv: 4300,
    amt: 2100,
  },
];

const componentRenderer: React.FC<WidgetProps> = React.memo(({ component }) => {
  const { props } = component;
  
  return (<div className=' h-24'>
    <ResponsiveContainer width="100%" height="100%">
        <BarChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="pv" fill="#8884d8" activeBar={<Rectangle fill="pink" stroke="blue" />} />
          <Bar dataKey="uv" fill="#82ca9d" activeBar={<Rectangle fill="gold" stroke="purple" />} />
        </BarChart>
      </ResponsiveContainer>
  </div>);
});




export const chartWidget = new ComponentBuilder()
  .setType(chartConfig.type)
  .setDefaultProps(
    Object.entries(chartConfig.props).reduce((props, [key, chartConfig]) => ({
      ...props,
      [key]: chartConfig.defaultValue
    }), {})
  )
  /*.addPropertySection({
    name: chartConfig.sections.basic.name,
    view: (props) => <PropertyEditor {...props} config={chartConfig} />
  })
  .addPropertySection({
    name: chartConfig.sections.style.name,
    view: (props) => <PropertyEditor {...props} config={chartConfig} />
  })
  .addPropertySection({
    name: config.sections.binding.name,
    view: (props) => <BindingProperties {...props} config={config} />
  })*/
  .setRender(componentRenderer)
  .build();
import { divWidget, divConfig } from './DivWidget';
import { spanWidget, spanConfig } from './SpanWidget';
import { textConfig, textWidget } from './TextWidget';
import { imgConfig, imgWidget } from './ImageWidget';
import { buttonConfig, buttonWidget } from './ButtonWidget';
import { chartWidget, chartConfig } from './ChartWidget';
import { tableWidget, tableConfig } from './TableWidget';
import { barchartConfig, barchartWidget } from './BarChartWidget';
import { linechartConfig, linechartWidget } from './LineChartWidget';
import { piechartConfig, piechartWidget } from './PieChartWidget';
import { radarchartConfig, radarchartWidget } from './RadarChartWidget';
import { textInputConfig, textInputWidget } from './TextInputWidget';

import { BarChart4, LineChart, PieChart, RadarIcon, TextCursorInput as TextInput, Type, Image, Square, Layers, Donut as ButtonIcon, Table as TableIcon } from "lucide-react";

// Kategori komponen
export const COMPONENT_CATEGORIES = {
  LAYOUT: 'Layout',
  BASIC: 'Basic',
  FORM: 'Form',
  DATA: 'Data Visualization',
  ADVANCED: 'Advanced'
};

// Konfigurasi komponen dengan metadata tambahan
const componentConfigs = {
  /*barchart: { 
    icon: BarChart4, 
    config: barchartConfig, 
    builder: barchartWidget,
    category: COMPONENT_CATEGORIES.DATA,
    description: 'Bar chart for comparing values across categories'
  },
  linechart: { 
    icon: LineChart, 
    config: linechartConfig, 
    builder: linechartWidget,
    category: COMPONENT_CATEGORIES.DATA,
    description: 'Line chart for showing trends over time'
  },
  piechart: { 
    icon: PieChart, 
    config: piechartConfig, 
    builder: piechartWidget,
    category: COMPONENT_CATEGORIES.DATA,
    description: 'Pie chart for showing proportions of a whole'
  },
  radarchart: { 
    icon: RadarIcon, 
    config: radarchartConfig, 
    builder: radarchartWidget,
    category: COMPONENT_CATEGORIES.DATA,
    description: 'Radar chart for comparing multiple variables'
  },
  textinput: { 
    icon: TextInput, 
    config: textInputConfig, 
    builder: textInputWidget,
    category: COMPONENT_CATEGORIES.FORM,
    description: 'Text input field for forms'
  },
  div: { 
    icon: Square, 
    config: divConfig, 
    builder: divWidget,
    category: COMPONENT_CATEGORIES.LAYOUT,
    description: 'Container element for layout'
  },
  span: { 
    icon: Layers, 
    config: spanConfig, 
    builder: spanWidget,
    category: COMPONENT_CATEGORIES.LAYOUT,
    description: 'Inline container element'
  },
  text: { 
    icon: Type, 
    config: textConfig, 
    builder: textWidget,
    category: COMPONENT_CATEGORIES.BASIC,
    description: 'Text display element'
  },
  img: { 
    icon: Image, 
    config: imgConfig, 
    builder: imgWidget,
    category: COMPONENT_CATEGORIES.BASIC,
    description: 'Image display element'
  },
  button: { 
    icon: ButtonIcon, 
    config: buttonConfig, 
    builder: buttonWidget,
    category: COMPONENT_CATEGORIES.FORM,
    description: 'Clickable button element'
  },
  chart: { 
    icon: BarChart4, 
    config: chartConfig, 
    builder: chartWidget,
    category: COMPONENT_CATEGORIES.DATA,
    description: 'Generic chart component'
  },
  table: { 
    icon: TableIcon, 
    config: tableConfig, 
    builder: tableWidget,
    category: COMPONENT_CATEGORIES.DATA,
    description: 'Table for displaying structured data'
  }*/
};



// Konfigurasi widget untuk editor
const widgetConfigs = {
  barchart: barchartConfig,
  linechart: linechartConfig,
  piechart: piechartConfig,
  radarchart: radarchartConfig,
  textinput: textInputConfig,
  div: divConfig,
  span: spanConfig,
  text: textConfig,
  img: imgConfig,
  button: buttonConfig,
  chart: chartConfig,
  table: tableConfig
};



// Fungsi untuk mendapatkan komponen berdasarkan kategori
export const getComponentsByCategory = (category: string) => {
  return Object.entries(componentConfigs)
    .filter(([_, config]) => config.category === category)
    .map(([type, config]) => ({
      type,
      icon: config.icon,
      description: config.description
    }));
};

// Fungsi untuk mendapatkan semua kategori
export const getAllCategories = () => {
  return Object.values(COMPONENT_CATEGORIES);
};

export { componentConfigs, widgetConfigs };

import { TrafficSource } from "@/lib/types";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ComposedChart,
} from "recharts";

interface TrafficChartProps {
  data: TrafficSource[];
}

export function TrafficChart({ data }: TrafficChartProps) {
  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis yAxisId="left" orientation="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
        
          <Bar yAxisId="left" dataKey="website" fill="#82ca9d" name="PAS. ARRIVALS" />
          <Bar yAxisId="left" dataKey="blog" fill="#ffc658" name="PAS DEPARTURES" />
          {/**<Line
            yAxisId="right"
            type="monotone"
            dataKey="conversion"
            stroke="#ff7300"
            name="Conversion Rate"
          /> */}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface GaugeChartProps {
  value: number;
  color?: string;
}

export function GaugeChart({ value, color = "#4ade80" }: GaugeChartProps) {
  const data = [
    { name: "Value", value: value },
    { name: "Remaining", value: 100 - value },
  ];

  const COLORS = [color, "#f3f4f6"];

  return (
    <div className="relative h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            startAngle={180}
            endAngle={0}
            innerRadius="60%"
            outerRadius="80%"
            paddingAngle={0}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-3xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">Percent</p>
        </div>
      </div>
    </div>
  );
}
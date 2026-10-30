
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import { formatCurrency } from "../../utils/currency";

export default function PaymentsCollectionChart({ data = [] }) {
  const chartData = data.map((item) => ({
    ...item,
    chartCollected: Number(item.total_collected) || 0,
  }));

  if (!chartData.length) {
    return <p>No payment collection data available.</p>;
  }

  const formatDateLabel = (value) => {
  const date = String(value).slice(0, 10);
  const [year, month, day] = date.split("-");

  const monthName = new Date(
    Number(year),
    Number(month) - 1,
    Number(day)
  ).toLocaleString("en-GB", { month: "short" });

  return `${monthName} ${Number(day)}`;
};


  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 20, left: 15, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />

        <XAxis
        dataKey="date"
        tick={{ fontSize: 11 }}
        tickFormatter={formatDateLabel}
        />

          <YAxis
            width={105}
            tick={{ fontSize: 11 }}
            tickMargin={8}
            tickFormatter={(value) => formatCurrency(value)}
          />

          <Tooltip
            formatter={(value) => [
              formatCurrency(value),
              "Payments Collected",
            ]}
            labelFormatter={(label) => `Date: ${label}`}
          />

          <Line
            type="monotone"
            dataKey="chartCollected"
            name="Payments Collected"
            stroke="#16a34a"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}


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


export default function RevenueChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-slate-400">
        No revenue data
      </div>
    );
  }

  // Support both existing and invoice-based API responses.
  const chartData = data.map((item) => ({
    ...item,
    chartRevenue: Number(
      item.total_revenue ?? item.revenue ?? 0
    ),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={chartData}
        margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis
          dataKey="date"
          tickFormatter={(value) => {
            if (!value) return "";
            const date = new Date(
              `${String(value).slice(0, 10)}T12:00:00`
            );
            return Number.isNaN(date.getTime())
              ? String(value)
              : date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
          }}
        />

        <YAxis
          width={105}
          tickFormatter={(value) => formatCurrency(value)}
          tick={{ fontSize: 11 }}
          tickMargin={8}
        />

        <Tooltip
          labelFormatter={(value) => String(value).slice(0, 10)}
          formatter={(value) => [
            formatCurrency(value),
            "Revenue",
          ]}
        />

        <Line
          type="monotone"
          dataKey="chartRevenue"
          name="Revenue"
          stroke="#4f46e5"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

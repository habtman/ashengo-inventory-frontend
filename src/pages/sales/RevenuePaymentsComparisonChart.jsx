
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

import { formatCurrency } from "../../utils/currency";

export default function RevenuePaymentsComparisonChart({
  revenueData = [],
  paymentsData = [],
}) {
  // Index payment data by date for reliable matching.
  const paymentsByDate = Object.fromEntries(
    paymentsData.map((item) => [
      String(item.date).slice(0, 10),
      Number(item.total_collected) || 0,
    ])
  );

  const chartData = revenueData.map((item) => {
    const date = String(item.date).slice(0, 10);

    return {
      date,
      revenue: Number(item.total_revenue ?? item.revenue) || 0,
      collected: paymentsByDate[date] || 0,
    };
  });

  if (!chartData.length) {
    return <p>No comparison data available.</p>;
  }

  return (
    <div style={{ width: "100%", height: 340 }}>
      <ResponsiveContainer>
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 20, left: 15, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
          />

          <YAxis
            width={105}
            tick={{ fontSize: 11 }}
            tickMargin={8}
            tickFormatter={(value) => formatCurrency(value)}
          />

          <Tooltip
            formatter={(value, name) => [
              formatCurrency(value),
              name,
            ]}
            labelFormatter={(label) => `Date: ${label}`}
          />

          <Legend />

          <Line
            type="monotone"
            dataKey="revenue"
            name="Invoiced Revenue"
            stroke="#2563eb"
            strokeWidth={3}
            dot={{ r: 4 }}
          />

          <Line
            type="monotone"
            dataKey="collected"
            name="Payments Collected"
            stroke="#16a34a"
            strokeWidth={3}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { formatCurrency } from "../../utils/currency";  

const COLORS = [
  "#22c55e", // Healthy
  "#eab308", // Warning
  "#ef4444", // Over Limit
];

export default function CreditDashboardCharts({ customers = [] }) {
    const totalOutstanding = customers.reduce(
  (sum, c) => sum + Number(c.outstanding || 0),
  0
);

const totalAvailable = customers.reduce(
  (sum, c) => sum + Number(c.available_credit || 0),
  0
);

const chartData = [
  {
    name: "Outstanding",
    value: totalOutstanding,
  },
  {
    name: "Available",
    value: totalAvailable,
  },
];

const topCustomers = [...customers]
  .sort(
    (a, b) =>
      Number(b.outstanding || 0) -
      Number(a.outstanding || 0)
  )
  .slice(0, 10);

  console.log(customers[0]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

      <div className="bg-white rounded-xl shadow border p-5">

        <h3 className="text-lg font-semibold mb-4">
          Credit Exposure
        </h3>

        <div style={{
            width: "100%",
            height: 350,
            background: "#f8fafc",
        }}
        >


          <ResponsiveContainer width="100%" height="100%">

            <PieChart>

              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >

                {chartData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[index]}
                  />
                ))}

              </Pie>

              <Tooltip />

            </PieChart>

          </ResponsiveContainer>

        </div>

      </div>

<div className="rounded-xl bg-white border shadow p-6">
  <h2 className="text-lg font-semibold mb-4">
    Top Credit Customers
  </h2>

  <div className="h-[420px]">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={topCustomers}>
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis
          dataKey="name"
          angle={-25}
          textAnchor="end"
          height={80}
        />

        <YAxis />

        <Tooltip
          formatter={(value) =>
            formatCurrency(value)
          }
        />

        <Bar
          dataKey="outstanding"
          fill="#2563eb"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>

    </div>
  );
}
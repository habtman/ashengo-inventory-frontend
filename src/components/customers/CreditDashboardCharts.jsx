import { useNavigate } from "react-router-dom";
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
    const navigate = useNavigate();

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
        <p className="text-sm text-slate-500 mb-4">
        Top 10 customers ranked by outstanding credit.
        </p>

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

                {chartData.map((entry, index, customer) => (
                  <Cell
                    key={entry.name}
                    fill={
                        customer.utilization_percent >= 90
                            ? "#dc2626"
                            : customer.utilization_percent >= 70
                            ? "#f59e0b"
                            : "#22c55e"
                        }
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

        <YAxis
            tickFormatter={(value) =>
            `ETB ${(value / 1000).toFixed(0)}k`
            }
        />

        <Tooltip
        formatter={(value) => formatCurrency(value)}
        labelFormatter={(label) => `Customer: ${label}`}
        />

        <Bar
        dataKey="outstanding"
        radius={[4, 4, 0, 0]}
        >
        {topCustomers.map((customer) => {

            const utilization =
            Number(customer.utilization_percent);

            let color = "#22c55e";

            if (utilization >= 80 && utilization <= 100) {
            color = "#f59e0b";
            }

            if (utilization > 100) {
            color = "#ef4444";
            }

            return (
            <Cell
                key={customer.id}
                fill={color}
                cursor="pointer"
                onClick={() =>
                navigate(`/customers/${customer.id}`)
                }
            />
            );

        })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>

    </div>
  );
}
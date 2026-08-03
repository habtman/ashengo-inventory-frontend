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


const COLORS = [
  "#22c55e", // Healthy
  "#eab308", // Warning
  "#ef4444", // Over Limit
];

export default function CreditDashboardCharts({ customers = [] }) {
    const navigate = useNavigate();

    const healthy = customers.filter(
    c => Number(c.utilization_percent) < 70
    ).length;

    const warning = customers.filter(
    c =>
        Number(c.utilization_percent) >= 70 &&
        Number(c.utilization_percent) <= 100
    ).length;

    const overLimit = customers.filter(
    c => Number(c.utilization_percent) > 100
    ).length;

    const chartData = [
    {
        name: "Healthy",
        value: healthy,
    },
    {
        name: "Near Limit",
        value: warning,
    },
    {
        name: "Over Limit",
        value: overLimit,
    },
    ];

    const topCustomers = [...customers]
    .map(c => ({
        ...c,
        outstanding: Number(c.outstanding),
        utilization_percent: Number(c.utilization_percent),
    }))
    .sort((a, b) => b.outstanding - a.outstanding)
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
                innerRadius={60}
                outerRadius={110}
                paddingAngle={4}
                label={({ percent }) =>
                `${(percent * 100).toFixed(0)}%`
                }
            >

               
            {chartData.map((entry, index) => (

            <Cell
                key={entry.name}
                fill={COLORS[index]}
            />

            ))}
                

              </Pie>

                <Tooltip
                formatter={(value) => [
                    `${value} customers`,
                    "Count",
                ]}
                />
            <Legend />

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
            tickFormatter={(name) =>
            name.length > 12
                ? name.substring(0,12) + "..."
                : name
            }
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
            formatter={(value) => [
                `${value} customers`,
                "Count",
            ]}
            />
        <Legend />

        <Bar
        dataKey="outstanding"
        radius={[4, 4, 0, 0]}
        >
        {topCustomers.map((customer) => {

            const utilization =
            Number(customer.utilization_percent);

            let color = "#22c55e";

            if (utilization >= 50)
            color = "#84cc16";

            if (utilization >= 70)
            color = "#facc15";

            if (utilization >= 85)
            color = "#f97316";

            if (utilization >= 100)
            color = "#dc2626";

            return (
            <Cell
                key={customer.id}
                fill={color}
                cursor="pointer"
                stroke="#fff"
                strokeWidth={1}
                onClick={() => navigate(`/customers/${customer.id}`)}
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
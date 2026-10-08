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
  "#eab308", // Near Limit
  "#ef4444", // Over Limit
];

export default function CreditDashboardCharts({ customers = [] }) {
  const navigate = useNavigate();

  /*
   * Credit status rules:
   *
   * CLEAR / HEALTHY  = 0 outstanding
   * ACTIVE / HEALTHY  = >0 and <80%
   * WARNING           = 80% - 100%
   * OVER_LIMIT        = >100%
   *
   * For the dashboard chart we group CLEAR + ACTIVE
   * together as "Healthy".
   */

  const healthy = customers.filter((customer) => {
    const utilization =
      Number(customer.utilization_percent) || 0;

    return utilization < 80;
  }).length;

  const warning = customers.filter((customer) => {
    const utilization =
      Number(customer.utilization_percent) || 0;

    return utilization >= 80 && utilization <= 100;
  }).length;

  const overLimit = customers.filter((customer) => {
    const utilization =
      Number(customer.utilization_percent) || 0;

    return utilization > 100;
  }).length;

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
    .map((customer) => ({
      ...customer,
      outstanding:
        Number(customer.outstanding) || 0,
      utilization_percent:
        Number(customer.utilization_percent) || 0,
    }))
    .sort(
      (a, b) =>
        b.outstanding - a.outstanding
    )
    .slice(0, 10);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

      {/* CREDIT STATUS DISTRIBUTION */}
      <div className="bg-white rounded-xl shadow border p-5">

        <h3 className="text-lg font-semibold mb-1">
          Credit Utilization Status
        </h3>

        <p className="text-sm text-slate-500 mb-4">
          Customer distribution by credit utilization.
        </p>

        <div
          style={{
            width: "100%",
            height: 350,
            background: "#f8fafc",
          }}
        >
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
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
                {chartData.map(
                  (entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={COLORS[index]}
                    />
                  )
                )}
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

      {/* TOP CREDIT CUSTOMERS */}
      <div className="rounded-xl bg-white border shadow p-6">

        <h2 className="text-lg font-semibold mb-1">
          Top Credit Customers
        </h2>

        <p className="text-sm text-slate-500 mb-4">
          Top 10 customers ranked by outstanding credit.
        </p>

        <div className="h-[420px]">

          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart data={topCustomers}>

              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="name"
                tickFormatter={(name) =>
                  name.length > 12
                    ? name.substring(0, 12) + "..."
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
                  `ETB ${Number(value).toLocaleString(
                    undefined,
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}`,
                  "Outstanding",
                ]}
              />

              <Legend />

              <Bar
                dataKey="outstanding"
                name="Outstanding Credit"
                radius={[4, 4, 0, 0]}
              >

                {topCustomers.map(
                  (customer) => {

                    const utilization =
                      Number(
                        customer.utilization_percent
                      ) || 0;

                    let color =
                      "#22c55e";

                    if (
                      utilization >= 80 &&
                      utilization <= 100
                    ) {
                      color = "#eab308";
                    }

                    if (
                      utilization > 100
                    ) {
                      color = "#ef4444";
                    }

                    return (
                      <Cell
                        key={customer.id}
                        fill={color}
                        cursor="pointer"
                        stroke="#fff"
                        strokeWidth={1}
                        onClick={() =>
                          navigate(
                            `/customers/${customer.id}`
                          )
                        }
                      />
                    );
                  }
                )}

              </Bar>

            </BarChart>
          </ResponsiveContainer>

        </div>
      </div>

    </div>
  );
}
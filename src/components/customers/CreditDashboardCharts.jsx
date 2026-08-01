import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = [
  "#22c55e", // Healthy
  "#eab308", // Warning
  "#ef4444", // Over Limit
];

export default function CreditDashboardCharts({ customers = [] }) {
  const chartData = [
    {
      name: "Healthy",
      value: customers.filter(c => c.status === "HEALTHY").length,
    },
    {
      name: "Warning",
      value: customers.filter(c => c.status === "WARNING").length,
    },
    {
      name: "Over Limit",
      value: customers.filter(c => c.status === "OVER_LIMIT").length,
    },
  ].filter(x => x.value > 0);

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

      <div className="bg-white rounded-xl shadow border p-5 flex items-center justify-center">

        <span className="text-slate-400">
          Top Credit Customers chart coming next…
        </span>

      </div>

    </div>
  );
}
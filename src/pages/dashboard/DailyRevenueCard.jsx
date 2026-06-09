import { useEffect, useState } from "react";
import {salesApi} from "../../api/salesApi";

export default function DailyRevenueCard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const load = async () => {
      try {
        const res = await salesApi.getDailyRevenue(today);
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [today]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        Loading revenue...
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow border">
      <h2 className="text-lg font-semibold mb-4">
        📊 Daily Revenue ({data.sale_date})
      </h2>

      <div className="space-y-2">
        <div className="text-2xl font-bold text-green-600">
          ${Number(data.total_revenue).toFixed(2)}
        </div>

        <div className="text-sm text-gray-600">
          {data.total_sales} sales today
        </div>
      </div>
    </div>
  );
}

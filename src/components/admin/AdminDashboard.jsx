import { useEffect, useState } from "react";
import adminApi from "../../api/adminApi";

export default function AdminDashboard() {
  const [data, setData] = useState(null);

useEffect(() => {
const load = async () => {
  try {
    const result =
      await adminApi.getDashboard();

    //console.log("Dashboard data:", result);

    setData(result);
  } catch (err) {
    console.error("Dashboard error:", err);
  }
};

  load();
}, []);

  if (!data) {
    return <p>Loading...</p>;
  }

  const cards = [
    {
      title: "Inventory Items",
      value: data.totalInventory
    },
    {
      title: "Stock Value",
      value: `$${data.totalStockValue}`
    },
    {
      title: "Today's Sales",
      value: `$${data.todaySales}`
    },
    {
      title: "Monthly Sales",
      value: `$${data.monthSales}`
    },
    {
      title: "Low Stock",
      value: data.lowStock
    },
    {
      title: "Out of Stock",
      value: data.outOfStock
    },
    {
      title: "Pending POs",
      value: data.pendingPOs
    },
    {
      title: "Locations",
      value: data.locations
    }
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

        {cards.map((card) => (
          <div
            key={card.title}
            className="
              bg-white
              p-5
              rounded-xl
              shadow
            "
          >
            <p className="text-gray-500 text-sm">
              {card.title}
            </p>

            <h2 className="text-2xl font-bold mt-2">
              {card.value}
            </h2>
          </div>
        ))}

      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import {salesApi} from "../../api/salesApi";
import RevenueChart from "../../components/sales/RevenueChart";


export default function SalesAnalyticsPage() {
const [loading, setLoading] = useState(true);   
const [profits, setProfits] = useState({});
const [topProducts, setTopProducts] = useState([]);
const [dailyRevenue, setDailyRevenue] = useState([]);


const fetchAnalytics = async () => {
try {
setLoading(true);

const profitRes = await salesApi.getProfits();
const topRes = await salesApi.getTopProducts();
const revenueTrend = await salesApi.getDailyRevenue();

setProfits(profitRes || {});
setTopProducts(topRes || []);
setDailyRevenue(revenueTrend || []);

} catch (err) {
console.error(err);
} finally {
setLoading(false);
}
};

useEffect(() => {
void fetchAnalytics();
}, []);




return (
<div className="space-y-6">

    {/* Page Title */}
    <h1 className="text-2xl font-bold text-slate-800">
    Sales Analytics
    </h1>

    {/* ================= KPI CARDS ================= */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

    <div className="bg-white rounded-xl shadow p-5">
        <p className="text-sm text-slate-500">Revenue</p>
        <h2 className="text-2xl font-bold">
        {loading ? "..." : `${profits.revenue || 0}`}
        </h2>

    </div>

    <div className="bg-white rounded-xl shadow p-5">
        <p className="text-sm text-slate-500">Cost</p>
        <h2 className="text-2xl font-bold">
        ${profits.cost || 0}
        </h2>
    </div>

    <div className="bg-white rounded-xl shadow p-5">
        <p className="text-sm text-slate-500">Profit</p>
        <h2 className="text-2xl font-bold text-green-600">
        ${profits.profit || 0}
        </h2>
    </div>

    </div>

    {/* ================= CHART PLACEHOLDER ================= */}
   <div className="bg-white rounded-xl shadow p-6">
    <h2 className="font-semibold mb-4">
        Revenue Trend
    </h2>

    <RevenueChart data={dailyRevenue} />
    </div>



    {/* ================= TOP PRODUCTS ================= */}
    <div className="bg-white rounded-xl shadow p-6">
    <h2 className="font-semibold mb-4">
        Top Selling Products
    </h2>

    <table className="w-full text-sm">
        <thead className="bg-slate-50">
        <tr>
            <th className="p-3 text-left">Product</th>
            <th className="p-3 text-left">Sold</th>
            <th className="p-3 text-left">Revenue</th>
        </tr>
        </thead>

        <tbody>
        {topProducts.map((p, i) => (
            <tr key={i} className="border-t">
            <td className="p-3">{p.name}</td>
            <td className="p-3">{p.total_sold}</td>
            <td className="p-3">
                ${p.total_revenue}
            </td>
            </tr>
        ))}
        </tbody>
    </table>
    </div>

</div>
);
}

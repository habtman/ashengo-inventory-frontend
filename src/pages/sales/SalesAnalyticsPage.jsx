
import { useCallback, useEffect, useState } from "react";
import { salesAnalyticsApi } from "../../api/salesAnalyticsApi";
import { formatCurrency } from "../../utils/currency";
import RevenueChart from "../../components/sales/RevenueChart";

const formatMoney = (value) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

function StatCard({ title, value, description }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>
      {description && (
        <p className="mt-2 text-sm text-slate-500">{description}</p>
      )}
    </div>
  );
}


const getLocalDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};


export default function SalesAnalyticsPage() {
  const [profits, setProfits] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [dailyRevenue, setDailyRevenue] = useState(null);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(getLocalDate);
  const [paymentsCollected, setPaymentsCollected] = useState(null);
  const [receivables, setReceivables] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [profitData, productsData, dailyData, trendData, paymentsData, receivablesData] =
        await Promise.all([
          salesAnalyticsApi.getProfits(),
          salesAnalyticsApi.getTopProducts(),
          salesAnalyticsApi.getDailyRevenue(selectedDate),  
          salesAnalyticsApi.getRevenueTrend(),
          salesAnalyticsApi.getPaymentsCollected(selectedDate),
          salesAnalyticsApi.getOutstandingReceivables(),
        ]);

      setProfits(profitData);
      setTopProducts(Array.isArray(productsData) ? productsData : []);
      setDailyRevenue(dailyData);
      setRevenueTrend(Array.isArray(trendData) ? trendData : []);
      setPaymentsCollected(paymentsData);
      setReceivables(receivablesData);  
    } catch (err) {
      console.error("Failed to load sales analytics:", err);
      setError(
        err?.message || "Unable to load sales analytics. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);   

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const revenue = Number(profits?.revenue) || 0;
  const cost = Number(profits?.cost) || 0;
  const profit = Number(profits?.profit) || 0;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

  if (loading) {
    return (
      <div className="p-6 text-slate-600">
        Loading sales analytics...
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
 
        <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-900">
            Sales Analytics
            </h1>
            <p className="mt-1 text-sm text-slate-500">
            Invoice-based sales performance and estimated profitability.
            </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
            <div>
            <label
                htmlFor="analytics-date"
                className="mb-1 block text-sm font-medium text-slate-600"
            >
                Daily revenue date
            </label>

            <input
                id="analytics-date"
                type="date"
                value={selectedDate}
                max={getLocalDate()}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
            />
            </div>

            <button
            type="button"
            onClick={fetchAnalytics}
            disabled={loading}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
            {loading ? "Loading..." : "Refresh"}
            </button>
        </div>
        </div>


      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
          <button
            type="button"
            onClick={fetchAnalytics}
            className="ml-3 font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Invoiced Revenue for Selected Date"
          value={formatMoney(dailyRevenue?.total_revenue)}
          description={`${Number(dailyRevenue?.total_sales) || 0} invoices`}
        />


      <StatCard
        title="Outstanding Receivables"
        value={formatCurrency(receivables?.outstanding_amount)}
        description={`${Number(receivables?.outstanding_invoices) || 0} invoices with balances due`}
      />

      <StatCard
        title="Overdue Receivables"
        value={formatCurrency(receivables?.overdue_amount)}
        description={`${Number(receivables?.overdue_invoices) || 0} overdue invoices`}
      />

      <StatCard
        title="Payments Collected"
        value={formatCurrency(paymentsCollected?.total_collected)}
        description={`${Number(paymentsCollected?.total_payments) || 0} payments received on selected date`}
      />



        <StatCard
          title="7-Day Revenue"
          value={formatMoney(revenue)}
          description="Revenue from confirmed sales orders"
        />

        <StatCard
          title="Estimated Cost"
          value={formatMoney(cost)}
          description="Based on current inventory costs"
        />

        <StatCard
          title="Estimated Profit"
          value={formatMoney(profit)}
          description={`Profit margin: ${margin.toFixed(1)}%`}
        />
      </section>

      {Number(profits?.item_lines_missing_cost) > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Profit estimates exclude{" "}
          {profits.item_lines_missing_cost} invoice line(s) with no recorded
          product cost. Update those costs for more complete estimates.
        </div>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Invoiced Revenue Trend — Last 7 Days
        </h2>

        {revenueTrend.length > 0 ? (
          <RevenueChart data={revenueTrend} />
        ) : (
          <p className="py-8 text-center text-sm text-slate-500">
            No invoiced sales found for this period.
          </p>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Top-Selling Products — Last 7 Days
        </h2>

        {topProducts.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">
            No product sales found for this period.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="px-3 py-3 font-medium">Product</th>
                  <th className="px-3 py-3 font-medium">SKU</th>
                  <th className="px-3 py-3 text-right font-medium">
                    Units Sold
                  </th>
                  <th className="px-3 py-3 text-right font-medium">
                    Invoiced Revenue
                  </th>
                </tr>
              </thead>

              <tbody>
                {topProducts.map((product, index) => (
                  <tr
                    key={`${product.inventory_id ?? product.sku}-${index}`}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-3 py-3 font-medium text-slate-800">
                      {product.name || "Unknown product"}
                    </td>
                    <td className="px-3 py-3 text-slate-600">
                      {product.sku || "—"}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      {Number(product.total_sold) || 0}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      {formatMoney(product.total_revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

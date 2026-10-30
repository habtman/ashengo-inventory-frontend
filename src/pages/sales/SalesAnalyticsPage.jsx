
import { useCallback, useEffect, useState } from "react";
import { salesAnalyticsApi } from "../../api/salesAnalyticsApi";
import { formatCurrency } from "../../utils/currency";
import RevenueChart from "../../components/sales/RevenueChart";
import PaymentsCollectionChart from "../../components/sales/PaymentsCollectionChart";
import RevenuePaymentsComparisonChart from "../../components/sales/RevenuePaymentsComparisonChart";


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
  const [paymentsTrend, setPaymentsTrend] = useState([]);

  const now = new Date();

  const [reportPeriod, setReportPeriod] = useState("month");
  const [reportYear, setReportYear] = useState(now.getFullYear());
  const [reportMonth, setReportMonth] = useState(now.getMonth() + 1);

  const [periodAnalytics, setPeriodAnalytics] = useState(null);
  const [periodLoading, setPeriodLoading] = useState(false);
  const [periodError, setPeriodError] = useState("");

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [profitData, productsData, dailyData, 
        trendData, paymentsData, receivablesData, paymentsTrendData] =
        await Promise.all([
          salesAnalyticsApi.getProfits(),
          salesAnalyticsApi.getTopProducts(),
          salesAnalyticsApi.getDailyRevenue(selectedDate),  
          salesAnalyticsApi.getRevenueTrend(),
          salesAnalyticsApi.getPaymentsCollected(selectedDate),
          salesAnalyticsApi.getOutstandingReceivables(),
          salesAnalyticsApi.getPaymentsTrend(),
        ]);

      setProfits(profitData);
      setTopProducts(Array.isArray(productsData) ? productsData : []);
      setDailyRevenue(dailyData);
      setRevenueTrend(Array.isArray(trendData) ? trendData : []);
      setPaymentsCollected(paymentsData);
      setReceivables(receivablesData);
      setPaymentsTrend(
        Array.isArray(paymentsTrendData) ? paymentsTrendData : []); 
    } catch (err) {
      console.error("Failed to load sales analytics:", err);
      setError(
        err?.message || "Unable to load sales analytics. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);   

  const fetchPeriodAnalytics = useCallback(async () => {
  setPeriodLoading(true);
  setPeriodError("");

  try {
    const data = await salesAnalyticsApi.getPeriodAnalytics(
      reportPeriod,
      reportYear,
      reportPeriod === "month" ? reportMonth : null
    );

    setPeriodAnalytics(data);
  } catch (err) {
    console.error("Failed to load period analytics:", err);
    setPeriodError(
      err?.message || "Unable to load the selected reporting period."
    );
  } finally {
    setPeriodLoading(false);
  }
}, [reportPeriod, reportYear, reportMonth]);

useEffect(() => {
  fetchPeriodAnalytics();
}, [fetchPeriodAnalytics]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const revenue = Number(profits?.revenue) || 0;
  const cost = Number(profits?.cost) || 0;
  const profit = Number(profits?.profit) || 0;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

  const selectedDayRevenue =
  Number(dailyRevenue?.total_revenue) || 0;

const selectedDayCollected =
  Number(paymentsCollected?.total_collected) || 0;

const selectedDayCollectionRate =
  selectedDayRevenue > 0
    ? (selectedDayCollected / selectedDayRevenue) * 100
    : null;

const sevenDayCollected = paymentsTrend.reduce(
  (sum, day) => sum + (Number(day.total_collected) || 0),
  0
);

const sevenDayCollectionRate =
  Number(profits?.revenue) > 0
    ? (sevenDayCollected / Number(profits.revenue)) * 100
    : null;

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
          value={formatCurrency(dailyRevenue?.total_revenue)}
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
          value={formatCurrency(revenue)}
          description="Revenue from confirmed sales orders"
        />

        <StatCard
          title="Estimated Cost"
          value={formatCurrency(cost)}
          description="Based on current inventory costs"
        />

        <StatCard
          title="Estimated Profit"
          value={formatCurrency(profit)}
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

      <section className="analytics-section">
        <h2>Payments Collection Trend</h2>

        <p>
          Daily payments received over the last seven days.
        </p>

        <PaymentsCollectionChart data={paymentsTrend} />
      </section>

      <section className="analytics-section">
        <h2>Revenue vs Payments Comparison</h2>

        <p>
          Compare invoiced sales with actual payments received over the last seven days.
        </p>

        <RevenuePaymentsComparisonChart
          revenueData={revenueTrend}
          paymentsData={paymentsTrend}
        />
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
                      {formatCurrency(product.total_revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
  <h2 className="mb-4 text-lg font-semibold text-slate-800">
    Collection Performance
  </h2>

  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    <div className="rounded-lg bg-slate-50 p-4">
      <p className="text-sm text-slate-500">
        Selected-Day Collection Rate
      </p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">
        {selectedDayCollectionRate === null
          ? "N/A"
          : `${selectedDayCollectionRate.toFixed(1)}%`}
      </p>
      <p className="mt-2 text-sm text-slate-500">
        {formatCurrency(selectedDayCollected)} collected from{" "}
        {formatCurrency(selectedDayRevenue)} invoiced
      </p>
    </div>

    <div className="rounded-lg bg-slate-50 p-4">
      <p className="text-sm text-slate-500">
        Seven-Day Collection Rate
      </p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">
        {sevenDayCollectionRate === null
          ? "N/A"
          : `${sevenDayCollectionRate.toFixed(1)}%`}
      </p>
      <p className="mt-2 text-sm text-slate-500">
        {formatCurrency(sevenDayCollected)} collected over the last seven days
      </p>
    </div>
  </div>

  <p className="mt-4 text-xs text-slate-500">
    These rates compare cash received with invoiced revenue for the
    same period. Payments may relate to invoices issued on earlier dates,
    so the rates are comparison indicators, not invoice settlement rates.
  </p>
</div>


<section className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
  <div className="flex flex-wrap items-end justify-between gap-4">
    <div>
      <h2 className="text-xl font-bold text-slate-900">
        Monthly / Yearly Sales Report
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Analyze invoiced revenue, estimated profitability and payments collected.
      </p>
    </div>

    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600">
          Reporting period
        </label>
        <select
          value={reportPeriod}
          onChange={(e) => setReportPeriod(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="month">Monthly</option>
          <option value="year">Yearly</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-600">
          Year
        </label>
        <select
          value={reportYear}
          onChange={(e) => setReportYear(Number(e.target.value))}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          {Array.from(
            { length: new Date().getFullYear() - 2020 + 1 },
            (_, index) => new Date().getFullYear() - index
          ).map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {reportPeriod === "month" && (
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-600">
            Month
          </label>
          <select
            value={reportMonth}
            onChange={(e) => setReportMonth(Number(e.target.value))}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            {[
              "January", "February", "March", "April",
              "May", "June", "July", "August",
              "September", "October", "November", "December",
            ].map((name, index) => (
              <option key={index + 1} value={index + 1}>
                {name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  </div>

  {periodError && (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      {periodError}
      <button
        type="button"
        onClick={fetchPeriodAnalytics}
        className="ml-3 font-semibold underline"
      >
        Try again
      </button>
    </div>
  )}

  {periodLoading ? (
    <p className="py-8 text-center text-slate-500">
      Loading reporting period...
    </p>
  ) : periodAnalytics ? (
    <>
      <p className="text-sm font-medium text-slate-600">
        Report: {reportPeriod === "month"
          ? new Date(reportYear, reportMonth - 1).toLocaleString("en-GB", {
              month: "long",
              year: "numeric",
            })
          : reportYear}
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Invoiced Revenue"
          value={formatCurrency(periodAnalytics.summary?.revenue)}
          description={`${Number(periodAnalytics.summary?.invoice_count) || 0} invoices`}
        />

        <StatCard
          title="Estimated Cost"
          value={formatCurrency(periodAnalytics.summary?.cost)}
          description="Based on current inventory costs"
        />

        <StatCard
          title="Estimated Profit"
          value={formatCurrency(periodAnalytics.summary?.profit)}
          description={`Profit margin: ${
            Number(periodAnalytics.summary?.revenue) > 0
              ? (
                  Number(periodAnalytics.summary.profit) /
                  Number(periodAnalytics.summary.revenue) * 100
                ).toFixed(1)
              : "0.0"
          }%`}
        />

        <StatCard
          title="Payments Collected"
          value={formatCurrency(
            periodAnalytics.trend?.reduce(
              (sum, item) => sum + (Number(item.total_collected) || 0),
              0
            )
          )}
          description="Payments received during this period"
        />
      </div>

      {Number(periodAnalytics.summary?.item_lines_missing_cost) > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Profit estimates exclude{" "}
          {periodAnalytics.summary.item_lines_missing_cost} invoice line(s)
          with no recorded product cost.
        </div>
      )}

      <div className="space-y-5">
        <div className="rounded-xl border border-slate-200 p-4">
          <h3 className="mb-4 font-semibold text-slate-900">
            Invoiced Revenue Trend
          </h3>
          <RevenueChart data={periodAnalytics.trend || []} />
        </div>

        <div className="rounded-xl border border-slate-200 p-4">
          <h3 className="mb-4 font-semibold text-slate-900">
            Payments Collection Trend
          </h3>
          <PaymentsCollectionChart data={periodAnalytics.trend || []} />
        </div>

        <div className="rounded-xl border border-slate-200 p-4">
          <h3 className="mb-4 font-semibold text-slate-900">
            Revenue vs Payments Comparison
          </h3>
          <RevenuePaymentsComparisonChart
            revenueData={periodAnalytics.trend || []}
            paymentsData={periodAnalytics.trend || []}
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 p-5">
        <h3 className="mb-4 font-semibold text-slate-900">
          Top-Selling Products
        </h3>

        {periodAnalytics.top_products?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[550px] text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="px-3 py-3">Product</th>
                  <th className="px-3 py-3">SKU</th>
                  <th className="px-3 py-3 text-right">Units Sold</th>
                  <th className="px-3 py-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {periodAnalytics.top_products.map((product, index) => (
                  <tr
                    key={`${product.inventory_id ?? product.sku}-${index}`}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-3 py-3 font-medium">
                      {product.name}
                    </td>
                    <td className="px-3 py-3">{product.sku || "—"}</td>
                    <td className="px-3 py-3 text-right">
                      {Number(product.total_sold) || 0}
                    </td>
                    <td className="px-3 py-3 text-right">
                      {formatCurrency(product.total_revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="py-5 text-center text-sm text-slate-500">
            No product sales found for this period.
          </p>
        )}
      </div>
    </>
  ) : null}
</section>


    </div>
  );
}

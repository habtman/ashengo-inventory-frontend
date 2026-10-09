import { useEffect, useState } from "react";
import customerApi from "../../api/customerApi";
import { formatCurrency } from "../../utils/currency";
import CustomerCreditTable from "../../components/customers/CustomerCreditTable";
import CreditDashboardCharts from "../../components/customers/CreditDashboardCharts";
import { hasPermission } from "../../utils/permissions";

export default function CustomerCreditDashboard() {
  const canManageCredit =
    hasPermission("customers.manage_credit");

  const [summary, setSummary] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!canManageCredit) {
      setLoading(false);
      return;
    }

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const [
          dashboardSummary,
          dashboardCustomers,
        ] = await Promise.all([
          customerApi.getCreditDashboardSummary(),
          customerApi.getCreditDashboardCustomers(),
        ]);

        setSummary(dashboardSummary);
        setCustomers(
          Array.isArray(dashboardCustomers)
            ? dashboardCustomers
            : []
        );
      } catch (err) {
        console.error(
          "Failed to load customer credit dashboard:",
          err
        );

        setError(
          err?.message ||
            "Failed to load customer credit dashboard."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [canManageCredit]);

  if (!canManageCredit) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          You do not have permission to view the customer
          credit dashboard.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Loading customer credit dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-5">
          <h2 className="text-sm font-semibold text-red-800">
            Unable to load customer credit dashboard
          </h2>

          <p className="mt-1 text-sm text-red-700">
            {error}
          </p>
        </div>
      </div>
    );
  }

  const totalAvailableCredit =
    Number(summary?.total_available_credit) || 0;

  const availableCreditClass =
    totalAvailableCredit < 0
      ? "text-red-600"
      : "text-green-600";

  return (
    <div className="max-w-7xl mx-auto p-6">

      {/* PAGE HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Customer Credit Dashboard
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Monitor customer credit limits, outstanding balances,
          and credit utilization.
        </p>
      </div>

      {/* SUMMARY CARDS */}
      {summary && (
        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-6
            gap-4
            mb-8
          "
        >

          {/* CUSTOMERS */}
          <div className="min-w-0 rounded-lg border bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-500">
              Customers
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900 tabular-nums">
              {summary.total_customers}
            </p>
          </div>

          {/* CREDIT LIMIT */}
          <div className="min-w-0 rounded-lg border bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-500">
              Credit Limit
            </p>

            <p
              className="
                mt-1
                text-lg
                font-bold
                tracking-tight
                tabular-nums
                whitespace-nowrap
                text-blue-600
              "
            >
              {formatCurrency(
                summary.total_credit_limit
              )}
            </p>
          </div>

          {/* OUTSTANDING */}
          <div className="min-w-0 rounded-lg border bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-500">
              Outstanding
            </p>

            <p
              className="
                mt-1
                text-lg
                font-bold
                tracking-tight
                tabular-nums
                whitespace-nowrap
                text-orange-600
              "
            >
              {formatCurrency(
                summary.total_outstanding
              )}
            </p>
          </div>

          {/* AVAILABLE CREDIT */}
          <div className="min-w-0 rounded-lg border bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-500">
              Available
            </p>

            <p
              className={`
                mt-1
                text-lg
                font-bold
                tracking-tight
                tabular-nums
                whitespace-nowrap
                ${availableCreditClass}
              `}
            >
              {formatCurrency(
                summary.total_available_credit
              )}
            </p>
          </div>

          {/* NEAR LIMIT */}
          <div className="min-w-0 rounded-lg border bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-500">
              Near Limit
            </p>

            <p className="mt-1 text-2xl font-bold text-yellow-600 tabular-nums">
              {summary.near_limit_customers}
            </p>
          </div>

          {/* OVER LIMIT */}
          <div className="min-w-0 rounded-lg border bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-gray-500">
              Over Limit
            </p>

            <p className="mt-1 text-2xl font-bold text-red-600 tabular-nums">
              {summary.over_limit_customers}
            </p>
          </div>

        </div>
      )}

      {/* CHARTS */}
      <CreditDashboardCharts
        customers={customers}
      />

      {/* CUSTOMER TABLE */}
      <CustomerCreditTable
        customers={customers}
      />

    </div>
  );
}
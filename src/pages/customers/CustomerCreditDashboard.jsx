import { useEffect, useState } from "react";
import customerApi from "../../api/customerApi";
import { formatCurrency } from "../../utils/currency";
import CustomerCreditTable from "../../components/customers/CustomerCreditTable";
import CreditDashboardSummary from "../../components/customers/CreditDashboardSummary";
import CreditDashboardCharts from "../components/customers/CreditDashboardCharts";

export default function CustomerCreditDashboard() {

  const [summary, setSummary] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    async function load() {

      try {

        const dashboardSummary =
          await customerApi.getCreditDashboardSummary();

          console.log("Dashboard Summary:", dashboardSummary);  
        const dashboardCustomers =
          await customerApi.getCreditDashboardCustomers();
         console.log("Dashboard Customers:", dashboardCustomers);   

        setSummary(dashboardSummary);
        setCustomers(dashboardCustomers);

      } catch (err) {

        console.error(err);

      } finally {

        setLoading(false);

      }

    }

    load();

  }, []);

  if (loading) {

    return <p>Loading dashboard...</p>;

  }

  return (

    <div className="max-w-7xl mx-auto p-6">

      <h1 className="text-2xl font-bold mb-6">
        Customer Credit Dashboard
      </h1>

      {summary && (
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">

                <div className="rounded-lg border bg-white p-4 shadow-sm">
                <p className="text-xs text-gray-500">Customers</p>
                <p className="text-2xl font-bold">
                    {summary.total_customers}
                </p>
                </div>

                <div className="rounded-lg border bg-white p-4 shadow-sm">
                <p className="text-xs text-gray-500">Credit Limit</p>
                <p className="text-xl font-bold text-blue-600">
                    {formatCurrency(summary.total_credit_limit)}
                </p>
                </div>

                <div className="rounded-lg border bg-white p-4 shadow-sm">
                <p className="text-xs text-gray-500">Outstanding</p>
                <p className="text-xl font-bold text-orange-600">
                    {formatCurrency(summary.total_outstanding)}
                </p>
                </div>

                <div className="rounded-lg border bg-white p-4 shadow-sm">
                <p className="text-xs text-gray-500">Available</p>
                <p className="text-xl font-bold text-green-600">
                    {formatCurrency(summary.total_available_credit)}
                </p>
                </div>

                <div className="rounded-lg border bg-white p-4 shadow-sm">
                <p className="text-xs text-gray-500">Near Limit</p>
                <p className="text-2xl font-bold text-yellow-600">
                    {summary.near_limit_customers}
                </p>
                </div>

                <div className="rounded-lg border bg-white p-4 shadow-sm">
                <p className="text-xs text-gray-500">Over Limit</p>
                <p className="text-2xl font-bold text-red-600">
                    {summary.over_limit_customers}
                </p>
                </div>

            </div>
            )}

        <CreditDashboardSummary customers={customers} />

        <CreditDashboardCharts customers={customers} />

        <CustomerCreditTable customers={customers} />


    </div>

  );

}
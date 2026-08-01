import { useEffect, useState } from "react";
import customerApi from "../../api/customerApi";
import { formatCurrency } from "../../utils/currency";

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

    </div>

  );

}
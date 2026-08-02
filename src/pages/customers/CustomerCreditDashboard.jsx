import CreditExposureCharts from "../../components/customers/CreditDashboardCharts";
import CustomerCreditTable from "../../components/customers/CustomerCreditTable";
import CustomerDashboardSummary from "../../components/customers/CreditDashboardSummary";   

export default function CustomerCreditDashboard() {
  return (
    <div className="space-y-6">

      <CustomerDashboardSummary />

      <CreditExposureCharts />

      <CustomerCreditTable />

    </div>
  );
}
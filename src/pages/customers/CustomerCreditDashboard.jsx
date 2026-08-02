export default function CustomerCreditDashboard() {
  return (
    <div className="space-y-6">

      <CustomerDashboardSummary />

      <CreditExposureCharts />

      <CustomerCreditTable />

    </div>
  );
}
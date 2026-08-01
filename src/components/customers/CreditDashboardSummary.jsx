import { formatCurrency } from "../../../utils/currency";

export default function CreditDashboardSummary({ customers = [] }) {
  const totalLimit = customers.reduce(
    (sum, c) => sum + Number(c.credit_limit || 0),
    0
  );

  const totalOutstanding = customers.reduce(
    (sum, c) => sum + Number(c.outstanding || 0),
    0
  );

  const totalAvailable = customers.reduce(
    (sum, c) => sum + Number(c.available_credit || 0),
    0
  );

  const overLimit = customers.filter(
    c => c.status === "OVER_LIMIT"
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">

      <div className="rounded-xl bg-white shadow border p-5">
        <p className="text-sm text-slate-500">
          Total Credit Limit
        </p>

        <h2 className="text-2xl font-bold mt-2">
          {formatCurrency(totalLimit)}
        </h2>
      </div>

      <div className="rounded-xl bg-white shadow border p-5">
        <p className="text-sm text-slate-500">
          Outstanding
        </p>

        <h2 className="text-2xl font-bold mt-2 text-red-600">
          {formatCurrency(totalOutstanding)}
        </h2>
      </div>

      <div className="rounded-xl bg-white shadow border p-5">
        <p className="text-sm text-slate-500">
          Available Credit
        </p>

        <h2 className="text-2xl font-bold mt-2 text-green-600">
          {formatCurrency(totalAvailable)}
        </h2>
      </div>

      <div className="rounded-xl bg-white shadow border p-5">
        <p className="text-sm text-slate-500">
          Over Limit Customers
        </p>

        <h2 className="text-2xl font-bold mt-2 text-red-600">
          {overLimit}
        </h2>
      </div>

    </div>
  );
}
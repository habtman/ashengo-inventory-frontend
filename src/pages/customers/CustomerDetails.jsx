import { useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import customerApi from "../../api/customerApi";
import CustomerLedger from "./CustomerLedger";
import { formatCurrency } from "../../utils/currency";   
import RecordPaymentModal from "./modals/RecordPaymentModal";
import CustomerStatement from "./reports/CustomerStatement";
import { hasPermission } from "../../utils/permissions"; 
import { exportCustomerReport } from "../../utils/customerReport";

export default function CustomerDetails() {
  const canReceivePayments = hasPermission("payments.receive");
  const canViewPayments = hasPermission("payments.view");
  const [activeTab, setActiveTab] = useState("invoices");
  const { id } = useParams();
  const [statement, setStatement] = useState([]);

  const [customer, setCustomer] =
    useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [ledger, setLedger] = useState({
      customer: {},
      invoices: [],
      payments: []
    });



const load = useCallback(async () => {
  const [
    customerData,
    ledgerData,
    statementData
  ] = await Promise.all([
    customerApi.getById(id),
    customerApi.getLedger(id),
    customerApi.getStatement(id)
  ]);

  setCustomer(customerData);
  setLedger(ledgerData);
  setStatement(statementData || []);
}, [id]);

useEffect(() => {
    load();
  }, [load]);


  if (!customer) return null;

  const outstanding =
  ledger.invoices?.reduce(
    (sum, io) =>
      sum + Number(io.balance_due || 0),
    0
  ) || 0;

const availableCredit =
  Number(
    ledger.customer?.credit_limit || 0
  ) - outstanding;

const totalPaid =
  ledger.payments?.reduce(
    (sum, p) =>
      sum + Number(p.amount || 0),
    0
  ) || 0;

  const statementWithBalances = statement.reduce(
  (acc, row) => {
    const debit = Number(row.debit || 0);
    const credit = Number(row.credit || 0);

    const previousBalance =
      acc.length > 0
        ? acc[acc.length - 1].balance
        : 0;

    let balance =
      previousBalance + debit - credit;

    if (Math.abs(balance) < 0.005) {
      balance = 0;
    }

    balance = Number(balance.toFixed(2));

    return [
      ...acc,
      {
        ...row,
        debit,
        credit,
        balance
      }
    ];
  },
  []
);
    

  return (
    <div className="p-6">

  <div className="flex items-center justify-between mb-6">
    <h1 className="text-2xl font-bold">
      {customer.name}
    </h1>

    <div className="flex gap-3 print:hidden">
      <button
        onClick={() =>
          exportCustomerReport({
            customer,
            ledger: {
              ...ledger,
              payments: canViewPayments
                ? ledger.payments
                : []
            },
            statement
          })
        }
        className="
          bg-blue-600
          text-white
          px-4
          py-2
          rounded
          hover:bg-blue-700
        "
      >
        Export Excel
      </button>

      <button
        onClick={() => window.print()}
        className="
          bg-gray-700
          text-white
          px-4
          py-2
          rounded
          hover:bg-gray-800
        "
      >
        Print
      </button>
    </div>
  </div>

      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <div className="text-gray-500 text-sm">
          Outstanding
        </div>
        <div className="text-2xl font-bold">
          {formatCurrency(outstanding.toFixed(2))}
        </div>
      </div>

      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <div className="text-gray-500 text-sm">
          Available Credit
        </div>
        <div className="text-2xl font-bold">
          {formatCurrency(availableCredit.toFixed(2))}
        </div>
      </div>

      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <div className="text-gray-500 text-sm">
          Total Paid
        </div>
        <div className="text-2xl font-bold">
          {formatCurrency(totalPaid.toFixed(2))}
        </div>
      </div>

      <div className="flex gap-4 mb-6">
    {canReceivePayments && (
        <button
          onClick={() =>
            setShowPaymentModal(true)
          }
          className="
            bg-green-600
            text-white
            px-4
            py-2
            rounded
          "
        >
          Record Payment
        </button>
    )}

      </div>

<div className="mt-8 bg-white rounded-lg shadow">

  <div className="flex border-b">

    <button
      onClick={() => setActiveTab("invoices")}
      className={`px-6 py-3 ${
        activeTab === "invoices"
          ? "border-b-2 border-blue-600 font-semibold"
          : "text-gray-500"
      }`}
    >
      Invoices
    </button>

  {canViewPayments && (
    <button
      onClick={() => setActiveTab("payments")}
      className={`px-6 py-3 ${
        activeTab === "payments"
          ? "border-b-2 border-blue-600 font-semibold"
          : "text-gray-500"
      }`}
    >
      Payments
    </button>
  )}
    
    <button
      onClick={() => setActiveTab("statement")}
      className={`px-6 py-3 ${
        activeTab === "statement"
          ? "border-b-2 border-blue-600 font-semibold"
          : "text-gray-500"
      }`}
    >
      Statement
    </button>

  </div>

  <div className="p-6">

    {activeTab === "invoices" && (
      <CustomerLedger
        customerId={id}
        mode="invoices"
      />
    )}

    {canViewPayments && activeTab === "payments" && (
      <CustomerLedger
        customerId={id}
        mode="payments"
      />
    )}

    {activeTab === "statement" && (
      <CustomerStatement
        customerId={id}
      />
    )}

  </div>

</div>
<div>
       {canReceivePayments && showPaymentModal && (

          <RecordPaymentModal
            customerId={id}
            invoices={
              ledger.invoices || []
            }
            onClose={() =>
              setShowPaymentModal(false)
            }
            onSuccess={load}
          />

        )}
      </div>

<div className="hidden print:block">

  <div className="mb-8">
    <h1 className="text-3xl font-bold">
      Customer Financial Report
    </h1>

    <div className="mt-4">
      <p>
        <strong>Customer:</strong>{" "}
        {customer.name}
      </p>

      <p>
        <strong>Customer Code:</strong>{" "}
        {customer.customer_code || "-"}
      </p>

      <p>
        <strong>Phone:</strong>{" "}
        {customer.phone || "-"}
      </p>

      <p>
        <strong>Email:</strong>{" "}
        {customer.email || "-"}
      </p>
    </div>
  </div>

  <div className="grid grid-cols-3 gap-4 mb-8">
    <div>
      <p className="text-sm">Outstanding</p>
      <p className="font-bold">
        {formatCurrency(outstanding.toFixed(2))}
      </p>
    </div>

    <div>
      <p className="text-sm">Available Credit</p>
      <p className="font-bold">
        {formatCurrency(
          availableCredit.toFixed(2)
        )}
      </p>
    </div>

    <div>
      <p className="text-sm">Total Paid</p>
      <p className="font-bold">
        {formatCurrency(totalPaid.toFixed(2))}
      </p>
    </div>
  </div>

  <h2 className="text-xl font-bold mb-3">
    Invoices
  </h2>

  <table className="w-full border-collapse mb-8">
    <thead>
      <tr>
        <th className="border p-2 text-left">
          Invoice
        </th>
        <th className="border p-2 text-left">
          Date
        </th>
        <th className="border p-2 text-right">
          Amount
        </th>
        <th className="border p-2 text-right">
          Paid
        </th>
        <th className="border p-2 text-right">
          Balance
        </th>
        <th className="border p-2 text-left">
          Status
        </th>
      </tr>
    </thead>

    <tbody>
      {(ledger.invoices || []).map((invoice) => (
        <tr key={invoice.id}>
          <td className="border p-2">
            {invoice.invoice_number}
          </td>

          <td className="border p-2">
            {invoice.created_at
              ? new Date(
                  invoice.created_at
                ).toLocaleDateString()
              : "-"}
          </td>

          <td className="border p-2 text-right">
            {formatCurrency(
              Number(
                invoice.total_amount || 0
              ).toFixed(2)
            )}
          </td>

          <td className="border p-2 text-right">
            {formatCurrency(
              Number(
                invoice.amount_paid || 0
              ).toFixed(2)
            )}
          </td>

          <td className="border p-2 text-right">
            {formatCurrency(
              Number(
                invoice.balance_due || 0
              ).toFixed(2)
            )}
          </td>

          <td className="border p-2">
            {invoice.status || "-"}
          </td>
        </tr>
      ))}
    </tbody>
  </table>

  {canViewPayments && (
    <>
      <h2 className="text-xl font-bold mb-3">
        Payments
      </h2>

      <table className="w-full border-collapse mb-8">
        <thead>
          <tr>
            <th className="border p-2 text-left">
              Date
            </th>
            <th className="border p-2 text-left">
              Invoice
            </th>
            <th className="border p-2 text-right">
              Amount
            </th>
            <th className="border p-2 text-left">
              Method
            </th>
          </tr>
        </thead>

        <tbody>
          {(ledger.payments || []).map((payment) => (
            <tr key={payment.id}>
              <td className="border p-2">
                {payment.payment_date ||
                payment.created_at
                  ? new Date(
                      payment.payment_date ||
                      payment.created_at
                    ).toLocaleDateString()
                  : "-"}
              </td>

              <td className="border p-2">
                {payment.invoice_number || "-"}
              </td>

              <td className="border p-2 text-right">
                {formatCurrency(
                  Number(
                    payment.amount || 0
                  ).toFixed(2)
                )}
              </td>

              <td className="border p-2">
                {payment.payment_method || "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )}

    <h2 className="text-xl font-bold mb-3">
      Statement
    </h2>

    <table className="w-full border-collapse">
      <thead>
        <tr>
          <th className="border p-2 text-left">
            Date
          </th>
          <th className="border p-2 text-left">
            Type
          </th>
          <th className="border p-2 text-left">
            Reference
          </th>
          <th className="border p-2 text-right">
            Debit
          </th>
          <th className="border p-2 text-right">
            Credit
          </th>
          <th className="border p-2 text-right">
            Balance
          </th>
        </tr>
      </thead>

      <tbody>
        {statementWithBalances.map((row, index) => (
          <tr
            key={`${row.date}-${row.reference}-${index}`}
          >
            <td className="border p-2">
              {row.date
                ? new Date(
                    row.date
                  ).toLocaleDateString()
                : "-"}
            </td>

            <td className="border p-2">
              {row.type || "-"}
            </td>

            <td className="border p-2">
              {row.reference || "-"}
            </td>

            <td className="border p-2 text-right">
              {row.debit
                ? formatCurrency(
                    row.debit.toFixed(2)
                  )
                : "-"}
            </td>

            <td className="border p-2 text-right">
              {row.credit
                ? formatCurrency(
                    row.credit.toFixed(2)
                  )
                : "-"}
            </td>

            <td className="border p-2 text-right">
              {formatCurrency(
                row.balance.toFixed(2)
              )}
            </td>
          </tr>
        ))}
      </tbody>
      </table>

    </div>
   </div>
    
  );
}
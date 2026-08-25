import { useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import customerApi from "../../api/customerApi";
import CustomerLedger from "./CustomerLedger";
import { formatCurrency } from "../../utils/currency";   
import RecordPaymentModal from "./modals/RecordPaymentModal";
import CustomerStatement from "./reports/CustomerStatement";
import { hasPermission } from "../../utils/permissions"; 

export default function CustomerDetails() {
  const canReceivePayments = hasPermission("payments.receive");
  const canViewPayments = hasPermission("payments.view");
 
 

  const [activeTab, setActiveTab] = useState("invoices");

  const { id } = useParams();

  const [customer, setCustomer] =
    useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [ledger, setLedger] = useState({
      customer: {},
      invoices: [],
      payments: []
    });


  const load = useCallback(async () => {
    const customerData =
      await customerApi.getById(id);

    const ledgerData =
      await customerApi.getLedger(id);

    setCustomer(customerData);
    setLedger(ledgerData);
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
    

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold">
        {customer.name}
      </h1>

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

    {canViewPayments && activeTab === "invoices" && (
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

    
  );
}
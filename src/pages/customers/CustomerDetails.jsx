import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import customerApi from "../../api/customerApi";
import CustomerLedger from "./CustomerLedger";
import CustomerStatement from "./CustomerStatement";
import RecordPaymentModal from "./RecordPaymentModal";

export default function CustomerDetails() {

  const { id } = useParams();

  const [customer, setCustomer] =
    useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [ledger, setLedger] = useState({
      customer: {},
      salesOrders: [],
      payments: []
    });


const load = async () => {
  const customerData =
    await customerApi.getById(id);

  const ledgerData =
    await customerApi.getLedger(id);

  setCustomer(customerData);
  setLedger(ledgerData);
};

useEffect(() => {
  load();
}, [id]);


  if (!customer) return null;

  const outstanding =
  ledger.salesOrders?.reduce(
    (sum, so) =>
      sum + Number(so.balance_due || 0),
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

      <div className="grid grid-cols-3 gap-4 mt-4">

        <div className="border p-4 rounded">
          <div>
            Outstanding: {outstanding.toFixed(2)}
          </div>
        </div>

        <div className="border p-4 rounded">
          <div>
            Available Credit: {availableCredit.toFixed(2)}
          </div>
        </div>


        <div className="border p-4 rounded">
          <div>
            Total Paid:{totalPaid.toFixed(2)}
          </div>
        </div>

        <div className="flex gap-3 mt-6">

        <button
          onClick={() =>
            setShowPaymentModal(true)
          }
          className="
            bg-green-600
            text-white
            px-4 py-2
            rounded
          "
        >
          Record Payment
        </button>

      <div className="p-6">
        <CustomerLedger
          customerId={id}
        />
      </div>
       <div className="p-6">
        <CustomerStatement
          customerId={id}
        />
      </div>
      </div>
             {showPaymentModal && (

          <RecordPaymentModal
            customerId={id}
            salesOrders={
              ledger.salesOrders || []
            }
            onClose={() =>
              setShowPaymentModal(false)
            }
            onSuccess={load}
          />

        )}

      </div>

    </div>
  );
}
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
  const [showPaymentModal,
  setShowPaymentModal] =
  useState(false);


  const fetchData = async () => {
  const data = await customerApi.getById(id);
    setCustomer(data);
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);


  if (!customer) return null;

  const availableCredit =
    Number(customer.credit_limit)
    -
    Number(customer.outstanding_balance);

  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold">
        {customer.name}
      </h1>

      <div className="grid grid-cols-3 gap-4 mt-4">

        <div className="border p-4 rounded">
          Credit Limit
          <div>
            {customer.credit_limit}
          </div>
        </div>

        <div className="border p-4 rounded">
          Outstanding
          <div>
            {customer.outstanding_balance}
          </div>
        </div>

        <div className="border p-4 rounded">
          Available Credit
          <div>
            {availableCredit}
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
              customer.salesOrders || []
            }
            onClose={() =>
              setShowPaymentModal(false)
            }
            onSuccess={fetchData}
          />

        )}

      </div>

    </div>
  );
}
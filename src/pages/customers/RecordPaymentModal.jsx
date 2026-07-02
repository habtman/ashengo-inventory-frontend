import { useState } from "react";
import customerPaymentApi from "../../api/customerPaymentApi";

export default function RecordPaymentModal({
  customerId,
  invoices,
  onClose,
  onSuccess
}) {

  const [invoiceId,
    setInvoiceId] = useState("");

  const [amount,
    setAmount] = useState("");

  const [paymentMethod,
    setPaymentMethod] =
      useState("CASH");

  const handleSubmit =
    async () => {

      await customerPaymentApi.create({
        customerId,
        invoiceId,
        amount,
        paymentMethod
      });

      onSuccess();
      onClose();
    };

    

  return (
    <div
      className="
        fixed inset-0
        bg-black/50
        flex items-center
        justify-center
      "
    >

      <div
        className="
          bg-white
          p-6
          rounded
          w-96
        "
      >

        <h2 className="font-bold mb-4">
          Record Payment
        </h2>

        <select
          className="border p-2 w-full mb-3"
          value={invoiceId}
          onChange={(e) =>
            setInvoiceId(
              e.target.value
            )
          }
        >

          <option value="">
            Select Invoice  
          </option>

          {invoices
            .filter(
              io =>
                Number(
                  io.balance_due
                ) > 0
            )
            .map(io => (
              <option
                key={io.id}
                value={io.id}
              >
                {io.so_number}
                {" - "}
                {io.balance_due}
              </option>
            ))}

        </select>

        <input
          type="number"
          placeholder="Amount"
          className="
            border
            p-2
            w-full
            mb-3
          "
          value={amount}
          onChange={(e) =>
            setAmount(
              e.target.value
            )
          }
        />

        <select
          className="
            border
            p-2
            w-full
            mb-4
          "
          value={paymentMethod}
          onChange={(e) =>
            setPaymentMethod(
              e.target.value
            )
          }
        >
          <option>CASH</option>
          <option>BANK</option>
          <option>TRANSFER</option>
        </select>

        <div className="flex gap-2">

          <button
            onClick={handleSubmit}
            className="
              bg-green-600
              text-white
              px-4 py-2
              rounded
            "
          >
            Save
          </button>

          <button
            onClick={onClose}
            className="
              bg-gray-500
              text-white
              px-4 py-2
              rounded
            "
          >
            Cancel
          </button>

        </div>

      </div>

    </div>
  );
}
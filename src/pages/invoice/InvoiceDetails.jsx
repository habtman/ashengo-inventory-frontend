import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import invoiceApi from "../../api/invoiceApi";

export default function InvoiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

 const [showPaymentModal, setShowPaymentModal] =
  useState(false);

const [paymentAmount, setPaymentAmount] =
  useState("");

const [paymentMethod, setPaymentMethod] =
  useState("CASH");

const [referenceNumber, setReferenceNumber] =
  useState("");

const [notes, setNotes] =
  useState("");

const [savingPayment, setSavingPayment] =
  useState(false);

  useEffect(() => {
  if (!id || id === ":id") {
    console.warn("Invalid ID, skipping fetch");
    return;
  }

  const loadInvoice = async () => {
    try {
      const data = await invoiceApi.getInvoiceById(id);
      setInvoice(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  loadInvoice();
}, [id]);


  if (loading) return <p>Loading invoice...</p>;
  if (!invoice) return <p>Invoice not found</p>;
  if (!id || id === ":id") {
  return <p>Invalid invoice ID</p>;
}

const handleRecordPayment = async () => {

  try {

    setSavingPayment(true);

    await invoiceApi.recordPayment(
      invoice.id,
      {
        amount: Number(paymentAmount),
        paymentMethod,
        referenceNumber,
        notes
      }
    );

    const updated =
      await invoiceApi.getInvoiceById(invoice.id);

    setInvoice(updated);

    setShowPaymentModal(false);

    setPaymentAmount("");
    setReferenceNumber("");
    setNotes("");

  } catch (err) {

    console.error(err);

    alert(
      err.message ||
      "Payment failed"
    );

  } finally {

    setSavingPayment(false);

  }

};

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-xl">

      <div className="flex justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">
            Invoice #{invoice.invoice_number}
          </h2>
          <p className="text-sm text-gray-500">
            {new Date(invoice.created_at).toLocaleString()}
          </p>
        </div>

        <button
          onClick={() => navigate("/invoices")}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          Back
        </button>
      </div>

<div className="mb-6">
  <h3 className="font-semibold">
    Customer
  </h3>

  <p>{invoice.customer_name}</p>
</div>

<div className="border rounded p-3">
  <p className="text-sm text-gray-500">
    Sales Order
  </p>

  <p className="font-semibold">
    {invoice.so_number}
  </p>
</div>

<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

  <div className="border rounded p-3">
    <p className="text-sm text-gray-500">
      Payment Type
    </p>

    <p className="font-semibold">
      {invoice.payment_method}
    </p>
  </div>

  <div className="border rounded p-3">
    <p className="text-sm text-gray-500">
      Status
    </p>

    <span
      className={
        invoice.status === "PAID"
          ? "text-green-600 font-semibold"
          : invoice.status === "PARTIALLY_PAID"
          ? "text-yellow-600 font-semibold"
          : "text-red-600 font-semibold"
      }
    >
      {invoice.status}
    </span>
  </div>

      <div className="border rounded p-3">
        <p className="text-sm text-gray-500">
          Amount Paid
        </p>

        <p className="font-semibold">
          ${Number(invoice.amount_paid || 0).toFixed(2)}
        </p>
      </div>

      <div className="border rounded p-3">
        <p className="text-sm text-gray-500">
          Balance Due
        </p>

        <p className="font-semibold">
          ${Number(invoice.balance_due || 0).toFixed(2)}
        </p>
      </div>

    </div>

  {/*  {invoice.payment_method === "CREDIT" && (
  <div className="border rounded p-4 bg-yellow-50 mb-6">

    <div className="flex justify-between">

      <div>

        <p className="text-sm text-gray-500">
          Credit Days
        </p>

        <p className="font-semibold">
          {invoice.credit_days}
        </p>

      </div>

      <div>

        <p className="text-sm text-gray-500">
          Due Date
        </p>

        <p className="font-semibold">
          {invoice.due_date
            ? new Date(invoice.due_date).toLocaleDateString()
            : "-"}
        </p>

      </div>

    </div>

  </div>
)}*/}

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Item</th>
            <th className="border p-2">SKU</th>
            <th className="border p-2">Qty</th>
            <th className="border p-2">Unit Price</th>
            <th className="border p-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map(item => (
            <tr key={item.inventory_id}>
              <td className="border p-2">{item.item_name}</td>
              <td className="border p-2">{item.sku}</td>
              <td className="border p-2">{item.quantity}</td>
              <td>
                ${Number(item.unit_price).toFixed(2)}
              </td>

              <td>
                ${Number(item.total_amount).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 text-right font-bold text-lg">
        Total: ${Number(invoice.total_amount).toFixed(2)}
      </div>

      <div className="flex gap-3 mt-6">

        <button
          onClick={() =>
            window.open(
              `/invoices/${invoice.id}/print`,
              "_blank"
            )
          }
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Print Invoice
        </button>

        <button
            onClick={() => setShowPaymentModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Record Payment
          </button>

        {invoice.balance_due > 0 && (

          <button
            onClick={() =>
              setShowPaymentModal(true)
            }
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Record Payment
          </button>

        )}

      </div>

      {showPaymentModal && (

<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

  <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">

    <h2 className="text-xl font-bold mb-4">
      Record Payment
    </h2>

    <div className="space-y-4">

      <div>
        <label className="block text-sm mb-1">
          Amount
        </label>

        <input
          type="number"
          className="border rounded w-full p-2"
          value={paymentAmount}
          onChange={(e)=>
            setPaymentAmount(e.target.value)
          }
        />
      </div>

      <div>
        <label className="block text-sm mb-1">
          Payment Method
        </label>

        <select
          className="border rounded w-full p-2"
          value={paymentMethod}
          onChange={(e)=>
            setPaymentMethod(e.target.value)
          }
        >
          <option value="CASH">
            Cash
          </option>

          <option value="BANK">
            Bank
          </option>

          <option value="CHEQUE">
            Cheque
          </option>

          <option value="MOBILE">
            Mobile Money
          </option>
        </select>

      </div>

      <div>
        <label className="block text-sm mb-1">
          Reference Number
        </label>

        <input
          className="border rounded w-full p-2"
          value={referenceNumber}
          onChange={(e)=>
            setReferenceNumber(e.target.value)
          }
        />
      </div>

      <div>

        <label className="block text-sm mb-1">
          Notes
        </label>

        <textarea
          className="border rounded w-full p-2"
          rows={3}
          value={notes}
          onChange={(e)=>
            setNotes(e.target.value)
          }
        />

      </div>

    </div>

    <div className="flex justify-end gap-3 mt-6">

      <button
        onClick={()=>
          setShowPaymentModal(false)
        }
        className="px-4 py-2 border rounded"
      >
        Cancel
      </button>

      <button
        onClick={handleRecordPayment}
        disabled={savingPayment}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        {savingPayment
          ? "Saving..."
          : "Save Payment"}
      </button>

    </div>

  </div>

</div>

)}

    </div>
  );
}

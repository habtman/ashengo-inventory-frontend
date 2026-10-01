import { useEffect, useState } from "react"; 
import { useParams, useNavigate } from "react-router-dom"; 
import salesOrderApi from "../../api/salesOrderApi";
import { formatCurrency } from "../../utils/currency";
import { hasPermission } from "../../utils/permissions";  


export default function SalesOrderDetails() { 
  const { id } = useParams(); 
  const navigate = useNavigate();

  const canConfirmSalesOrder =
  hasPermission("sales_orders.confirm");

  const [so, setSo] = useState(null); 
  const [loading, setLoading] = useState(true); 
  const [confirming, setConfirming] = useState(false);
  

useEffect(() => {
  const fetchData = async () => {
    try {
      const data = await salesOrderApi.getById(id);
      setSo(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load Sales Order");
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [id]);

const handleConfirm = async () => {
      try {
        setConfirming(true);

        console.log("CONFIRMING SALES ORDER:", id);
        console.log("ITEMS BEFORE CONFIRM:", so.items);

        await salesOrderApi.confirm(id);

        alert("Sales Order confirmed");

        const data = await salesOrderApi.getById(id);
        setSo(data);

      } catch (err) {
        console.error("CONFIRM ERROR:", err);

        alert(err.message || "Failed to confirm Sales Order");

      } finally {
        setConfirming(false);
      }
    };

    const statusColor = {
      DRAFT: "bg-gray-500",
      CONFIRMED: "bg-green-600",
    };

    if (loading) {
      return <div>Loading…</div>;
    }

    if (!so) {
      return <div>Sales Order not found</div>;
    }

return (
  <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">

{/* =====================================================
    HEADER
====================================================== */}
<div
  className="
    flex
    flex-col
    sm:flex-row
    sm:items-center
    sm:justify-between
    gap-3
  "
>

  {/* LEFT */}
  <div className="flex items-center gap-3 min-w-0">

<button
  type="button"
  onClick={() => navigate("/sales-orders")}
  className="
    shrink-0
    inline-flex
    items-center
    gap-1.5
    px-3
    py-2
    rounded-lg
    border
    border-slate-300
    bg-white
    text-slate-700
    text-sm
    font-medium
    hover:bg-slate-50
    hover:border-slate-400
    transition
  "
>
  ← Back
</button>

    <h2 className="text-xl sm:text-2xl font-bold break-words">
      Sales Order #{so.so_number}
    </h2>

  </div>


  {/* RIGHT */}
  {so.status === "CONFIRMED" && (
    <button
      type="button"
      onClick={() =>
        window.open(
          `/sales-orders/${so.id}/print`,
          "_blank",
          "width=900,height=800"
        )
      }
      className="
        w-full
        sm:w-auto
        shrink-0
        bg-blue-600
        hover:bg-blue-700
        text-white
        px-4
        py-2
        rounded-lg
        text-sm
        font-medium
        transition
      "
    >
      Print
    </button>
  )}

</div>


    {/* =====================================================
        SALES ORDER INFORMATION
    ====================================================== */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

      {/* LEFT INFORMATION */}
      <div
        className="
          rounded-xl
          border
          border-slate-200
          bg-white
          p-4
          space-y-2
          text-sm
        "
      >

        <p>
          <strong className="text-slate-700">
            Customer:
          </strong>{" "}
          <span className="text-slate-600">
            {so.customer_name}
          </span>
        </p>

        <p>
          <strong className="text-slate-700">
            Payment Method:
          </strong>{" "}
          <span className="text-slate-600">
            {so.payment_method || "-"}
          </span>
        </p>

        <p>
          <strong className="text-slate-700">
            Credit Terms:
          </strong>{" "}
          <span className="text-slate-600">
            {so.credit_days || "-"} Days
          </span>
        </p>

        <p>
          <strong className="text-slate-700">
            Balance Due:
          </strong>{" "}
          <span className="font-medium tabular-nums">
            {formatCurrency(so.balance_due)}
          </span>
        </p>

        <p>
          <strong className="text-slate-700">
            Due Date:
          </strong>{" "}
          <span className="text-slate-600">
            {so.due_date
              ? new Date(so.due_date).toLocaleDateString("en-GB")
              : "-"}
          </span>
        </p>

        <p>
          <strong className="text-slate-700">
            Created By:
          </strong>{" "}
          <span className="text-slate-600">
            {so.created_by_name || "-"}
          </span>
        </p>

        <p>
          <strong className="text-slate-700">
            Created:
          </strong>{" "}
          <span className="text-slate-600">
            {new Date(so.created_at).toLocaleString()}
          </span>
        </p>

      </div>


      {/* RIGHT INFORMATION */}
      <div
        className="
          rounded-xl
          border
          border-slate-200
          bg-white
          p-4
          space-y-3
          text-sm
        "
      >

        <p className="flex flex-wrap items-center gap-2">

          <strong className="text-slate-700">
            Status:
          </strong>

          <span
            className={`
              inline-flex
              px-3
              py-1
              rounded-full
              text-xs
              font-medium
              text-white
              ${statusColor[so.status]}
            `}
          >
            {so.status}
          </span>

        </p>

        <p>
          <strong className="text-slate-700">
            Confirmed By:
          </strong>{" "}
          <span className="text-slate-600">
            {so.confirmed_by_name || "-"}
          </span>
        </p>

        <p>
          <strong className="text-slate-700">
            Confirmed At:
          </strong>{" "}
          <span className="text-slate-600">
            {so.confirmed_at
              ? new Date(so.confirmed_at).toLocaleString()
              : "-"}
          </span>
        </p>

      </div>

    </div>


    {/* =====================================================
        ITEMS
    ====================================================== */}
    <div
      className="
        rounded-xl
        border
        border-slate-200
        bg-white
        overflow-hidden
      "
    >

      <div className="px-4 py-3 border-b border-slate-200">
        <h3 className="text-base sm:text-lg font-semibold text-slate-800">
          Sales Order Items
        </h3>
      </div>


      {/* Horizontal scroll only when necessary */}
      <div className="w-full overflow-x-auto">

        <table className="min-w-[700px] lg:min-w-0 w-full text-sm">

          <thead className="bg-slate-50">

            <tr className="border-b border-slate-200">

              <th
                className="
                  px-3
                  py-2.5
                  text-left
                  text-xs
                  font-semibold
                  text-slate-600
                  whitespace-nowrap
                "
              >
                Item
              </th>

              <th
                className="
                  px-3
                  py-2.5
                  text-right
                  text-xs
                  font-semibold
                  text-slate-600
                  whitespace-nowrap
                "
              >
                Quantity
              </th>

              <th
                className="
                  px-3
                  py-2.5
                  text-right
                  text-xs
                  font-semibold
                  text-slate-600
                  whitespace-nowrap
                "
              >
                Unit Price
              </th>

              <th
                className="
                  px-3
                  py-2.5
                  text-right
                  text-xs
                  font-semibold
                  text-slate-600
                  whitespace-nowrap
                "
              >
                Line Total
              </th>

            </tr>

          </thead>


          <tbody className="divide-y divide-slate-100">

            {so.items.map((item) => (

              <tr
                key={item.id}
                className="hover:bg-slate-50 transition"
              >

                <td className="px-3 py-2.5 font-medium text-slate-900">
                  {item.item_name}
                </td>

                <td
                  className="
                    px-3
                    py-2.5
                    text-right
                    tabular-nums
                    whitespace-nowrap
                  "
                >
                  {item.quantity}
                </td>

                <td
                  className="
                    px-3
                    py-2.5
                    text-right
                    tabular-nums
                    whitespace-nowrap
                  "
                >
                  {formatCurrency(item.unit_price)}
                </td>

                <td
                  className="
                    px-3
                    py-2.5
                    text-right
                    font-medium
                    tabular-nums
                    whitespace-nowrap
                  "
                >
                  {formatCurrency(item.total_amount)}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>


    {/* =====================================================
        TOTAL
    ====================================================== */}
    <div
      className="
        flex
        justify-end
        border-t
        border-slate-200
        pt-4
      "
    >

      <div className="text-right">

        <p className="text-sm text-slate-500">
          Order Total
        </p>

        <h3 className="text-xl sm:text-2xl font-bold tabular-nums">
          {formatCurrency(so.total_amount)}
        </h3>

      </div>

    </div>


    {/* =====================================================
        ACTIONS
    ====================================================== */}
    <div className="flex flex-col sm:flex-row sm:justify-end gap-2">

      {canConfirmSalesOrder && so.status === "DRAFT" && (

        <button
          type="button"
          onClick={handleConfirm}
          disabled={confirming}
          className="
            w-full
            sm:w-auto
            bg-green-600
            hover:bg-green-700
            disabled:opacity-50
            disabled:cursor-not-allowed
            text-white
            px-4
            py-2.5
            rounded-lg
            text-sm
            font-medium
            transition
          "
        >
          {confirming
            ? "Confirming..."
            : "Confirm Sales Order"}
        </button>

      )}

    </div>

  </div>
);
}






import { useEffect, useState} from "react";
import { useParams, useLocation } from "react-router-dom";
import purchaseOrderApi from "../../api/purchaseOrderApi";
import html2pdf from "html2pdf.js";


export default function PurchaseOrderPrint() {
  const { id } = useParams();

  const [po, setPo] = useState(null);
  const location = useLocation();

  const download =
      new URLSearchParams(location.search).get("download");


  useEffect(() => {
    const load = async () => {
      const data = await purchaseOrderApi.getById(id);
      setPo(data);
    };

    load();
  }, [id]);



useEffect(() => {
  if (!po) return;

  const timer = setTimeout(() => {

    if (download) {

      html2pdf()
        .from(document.getElementById("print-area"))
        .set({
          margin: 10,
          filename: `${po.po_number}.pdf`,
          html2canvas: {
            scale: 2
          },
          jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait"
          }
        })
        .save();

    } else {

      window.print();

    }

  }, 500);

  return () => clearTimeout(timer);

}, [po, download]);

useEffect(() => {
  if (!po) return;

  const timer = setTimeout(() => {
    window.print();
  }, 500);

  return () => clearTimeout(timer);
}, [po]);

  if (!po) {
    return <div>Loading...</div>;
  }

  return (
    <div
      id="print-area"
      className="max-w-4xl mx-auto bg-white p-8"
    >
      <div className="text-center border-b pb-4 mb-6">

  <h1 className="text-3xl font-bold">
    Ashengo Inventory
  </h1>

  <p>
    Addis Ababa, Ethiopia
  </p>

  <p>
    Tel: +251 xxx xxx xxx
  </p>

  <p>
    Email: procurement@ashengo.com
  </p>

</div>
      <div className="flex items-center justify-between border-b pb-4 mb-8">

        <div>
          {/* logo */}
          <img
            src="/logo.png"
            alt="Ashengo"
            className="h-16"
          />
        </div>

        <div className="text-right">
          <h1 className="text-3xl font-bold">
            PURCHASE ORDER
          </h1>

          <p>{po.po_number}</p>
        </div>

      </div>

  <div className="grid grid-cols-2 gap-8 mb-8">

  <div>
    <h3 className="font-bold border-b mb-2">
      Supplier
    </h3>

    <p><strong>Code:</strong> {po.supplier_code}</p>
    <p><strong>Name:</strong> {po.supplier_name}</p>
    <p><strong>Contact:</strong> {po.contact_person || "-"}</p>
    <p><strong>Phone:</strong> {po.phone || "-"}</p>
    <p><strong>Email:</strong> {po.email || "-"}</p>
    <p><strong>Address:</strong> {po.address || "-"}</p>
  </div>

  <div className="text-right">
    <h3 className="font-bold border-b mb-2">
      Purchase Order
    </h3>

    <p><strong>PO No:</strong> {po.po_number}</p>
    <p><strong>Date:</strong> {new Date(po.created_at).toLocaleDateString()}</p>
    <p><strong>Status:</strong> {po.status}</p>
    <p><strong>Currency:</strong> {po.currency}</p>
  </div>

</div>

        <div className="bg-gray-100 rounded p-4 mt-6">

          <h3 className="font-semibold mb-2">
          Approval
          </h3>

        <p>
          Approved By:
          <strong> {po.approved_by_name || "-"}</strong>
        </p>

        <p>
          Approved At:
          <strong>
          {" "}
          {po.approved_at
          ? new Date(po.approved_at).toLocaleString()
          : "-"}
          </strong>
        </p>

        </div>

      <table className="w-full border border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th>Item</th>
            <th>Ordered</th>
            <th>Received</th>
            <th>Remaining</th>
            <th>Unit Cost</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>
          {po.items.map((item,index) => (
            <tr key={item.inventory_id}>
              <td>{index+1}</td>
              <td className="border p-2">
                {item.item_name}
              </td>

              <td>{item.quantity}</td>

              <td>{item.received_quantity}</td>

              <td>{item.quantity - item.received_quantity}</td>

              <td className="border p-2 text-right">
                {Number(
                  item.cost_price
                ).toFixed(2)}
              </td>

              <td className="border p-2 text-right">
                {Number(
                  item.total_amount
                ).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 text-right">
        <p>
          <strong>Currency:</strong> {po.currency}
        </p>

        {po.currency !== "ETB" && (
          <p>
            <strong>Exchange Rate:</strong> {po.exchange_rate}
          </p>
        )}

        <h2 className="text-xl font-bold">
          Total ({po.currency}):{" "}
          {Number(po.foreign_total).toLocaleString(undefined,{
            minimumFractionDigits:2
          })}
        </h2>

        {po.currency !== "ETB" && (
          <h3 className="text-lg font-semibold">
            ETB Total:{" "}
            {Number(po.total_amount).toLocaleString(undefined,{
              minimumFractionDigits:2
            })}
          </h3>
        )}
      </div>
      <div className="grid grid-cols-3 gap-8 mt-16 text-center">

      <div>
        ____________________
        <br/>
        Prepared By
      </div>

      <div>
        ____________________
        <br/>
        Checked By
      </div>

      <div>
        ____________________
        <br/>
        Approved By
      </div>

      </div>

    </div>
  );
}
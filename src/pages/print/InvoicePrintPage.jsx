import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import invoiceApi from "../../api/invoiceApi";
import settingsApi from "../../api/settingsApi";  

export default function InvoicePrintPage() {
  const { id } = useParams();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState(null); 

  useEffect(() => {
    const loadInvoice = async () => {
      try {
        const [invoiceData, companyData] = await Promise.all([
          invoiceApi.getInvoiceById(id),
          settingsApi.getCompanySettings()
        ]);
        setInvoice(invoiceData);
        setCompany(companyData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadInvoice();
  }, [id]);

useEffect(() => {
  if (invoice) {
    setTimeout(() => {
      window.print();

      window.onafterprint = () => {
        window.close();
      };
    }, 1000);
  }
}, [invoice]);

  if (loading) return <p>Loading...</p>;
  if (!invoice) return <p>Invoice not found</p>;

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white">

      {/* Company Header */}
     <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">
            {company?.company_name || "Company Name"}
        </h1>

        <p>{company?.address}</p>

        <p>{company?.phone}</p>

        <p>{company?.email}</p>

        {company?.tax_number && (
            <p>Tax No: {company.tax_number}</p>
        )}
        </div>

      {/* Invoice Info */}
      <div className="flex justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold">
            INVOICE
          </h2>

          <p>
            #{invoice.invoice_number}
          </p>
        </div>

        <div className="text-right">
          <p>
            Date:
          </p>

          <p>
            {new Date(
              invoice.created_at
            ).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Customer */}
      <div className="mb-6">
        <h3 className="font-semibold">
          Customer
        </h3>

        <p>
          {invoice.customer_name}
        </p>
      </div>

      {/* Items */}
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">
              Item
            </th>

            <th className="border p-2">
              SKU
            </th>

            <th className="border p-2">
              Qty
            </th>

            <th className="border p-2">
              Unit Price
            </th>

            <th className="border p-2">
              Total
            </th>
          </tr>
        </thead>

        <tbody>
          {invoice.items?.map((item) => (
            <tr key={item.inventory_id}>
              <td className="border p-2">
                {item.item_name}
              </td>

              <td className="border p-2">
                {item.sku}
              </td>

              <td className="border p-2">
                {item.quantity}
              </td>

              <td className="border p-2">
                ${Number(item.unit_price).toFixed(2)}
              </td>

              <td className="border p-2">
                ${Number(item.total_amount).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Total */}
      <div className="text-right mt-6">
        <h2 className="text-2xl font-bold">
          Total: $
          {Number(invoice.total_amount).toFixed(2)}
        </h2>
      </div>

      <div className="mt-12 text-center text-sm text-gray-500">
        <p>
            {company?.invoice_footer ||
            "Thank you for your business"}
        </p>
      </div>

    </div>
  );
}
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import invoiceApi from "../api/invoiceApi";
import settingsApi from "../api/settingsApi";

export default function InvoicePrintPage() {
  const { id } = useParams();

  const [invoice, setInvoice] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!loading && invoice) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [loading, invoice]);

  const loadData = async () => {
    try {
      const [invoiceData, companyData] =
        await Promise.all([
          invoiceApi.getInvoice(id),
          settingsApi.getCompanySettings(),
        ]);

      setInvoice(invoiceData);
      setCompany(companyData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        Loading invoice...
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-6 text-red-600">
        Invoice not found
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <div
        id="invoice-print"
        className="max-w-4xl mx-auto bg-white p-10 shadow"
      >
        {/* Company Header */}
        <div className="text-center border-b pb-4 mb-6">
          <h1 className="text-3xl font-bold">
            {company?.company_name || "Company Name"}
          </h1>

          <p>{company?.address}</p>
          <p>{company?.phone}</p>
          <p>{company?.email}</p>

          {company?.tax_number && (
            <p>
              Tax No: {company.tax_number}
            </p>
          )}
        </div>

        {/* Invoice Header */}
        <div className="flex justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">
              Invoice
            </h2>

            <p>
              Invoice #:{" "}
              {invoice.invoice_number}
            </p>

            <p>
              Date:{" "}
              {new Date(
                invoice.created_at
              ).toLocaleDateString()}
            </p>
          </div>

          <div className="text-right">
            <h3 className="font-semibold">
              Customer
            </h3>

            <p>
              {invoice.customer_name ||
                "Walk-in Customer"}
            </p>

            {invoice.customer_phone && (
              <p>
                {invoice.customer_phone}
              </p>
            )}
          </div>
        </div>

        {/* Items */}
        <table className="w-full border border-collapse mb-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">
                Item
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
              <tr key={item.id}>
                <td className="border p-2">
                  {item.item_name}
                </td>

                <td className="border p-2 text-center">
                  {item.quantity}
                </td>

                <td className="border p-2 text-right">
                  {Number(
                    item.unit_price
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

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64">
            <div className="flex justify-between py-2 border-b">
              <span>Total</span>

              <span className="font-bold">
                {Number(
                  invoice.total_amount
                ).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-600">
          <p>
            {company?.invoice_footer ||
              "Thank you for your business"}
          </p>
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import customerApi from "../../api/customerApi";
import { formatCurrency } from "../../utils/currency";
import EditCreditLimitModal from "./modals/EditCreditLimitModal";
import Pagination from "./Pagination";
import { hasPermission } from "../../utils/permissions";

const PAGE_SIZE = 10;

export default function CustomersList() {
  const canCreateCustomer = hasPermission("customers.create");
  const canEditCustomerCreditLimit = hasPermission(
    "customers.manage_credit"
  );

  const [customers, setCustomers] = useState([]);

  const [page, setPage] = useState(1);

  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [showLimitModal, setShowLimitModal] = useState(false);

  const loadCustomers = async () => {
    try {
      const data = await customerApi.getAll();

      setCustomers(data);

      // Keep pagination valid after reload
      const totalPages = Math.max(
        1,
        Math.ceil(data.length / PAGE_SIZE)
      );

      setPage((currentPage) =>
        Math.min(currentPage, totalPages)
      );
    } catch (err) {
      console.error("Failed to load customers:", err);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const totalPages = Math.ceil(
    customers.length / PAGE_SIZE
  );

  const paginatedCustomers = customers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );


return (
  <div className="h-[calc(100dvh-64px)] min-h-0 flex flex-col p-3 sm:p-4">

    {/* Header */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 shrink-0">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Customers
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage customers and their credit limits.
        </p>
      </div>

      {canCreateCustomer && (
        <Link
          to="/customers/new"
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + New Customer
        </Link>
      )}
    </div>

    {/* Customers Table */}
    <div className="flex-1 min-h-0 flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden">

      <div className="flex-1 min-h-0 overflow-auto">
        <table className="w-full min-w-[700px] text-sm">

          <thead className="sticky top-0 z-10 bg-slate-50 text-slate-600">
            <tr>
              <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold">
                Code
              </th>

              <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold">
                Name
              </th>

              <th className="border-b border-slate-200 px-4 py-3 text-left font-semibold">
                Phone
              </th>

              <th className="border-b border-slate-200 px-4 py-3 text-right font-semibold">
                Credit Limit
              </th>

              <th className="border-b border-slate-200 px-4 py-3 text-center font-semibold">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {paginatedCustomers.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-slate-500"
                >
                  No customers found.
                </td>
              </tr>
            ) : (
              paginatedCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {customer.customer_code}
                  </td>

                  <td className="px-4 py-3 font-medium text-slate-800">
                    {customer.name}
                  </td>

                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {customer.phone || "—"}
                  </td>

                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-3">
                      <span className="font-medium text-slate-700 tabular-nums">
                        {formatCurrency(customer.credit_limit)}
                      </span>

                      {canEditCustomerCreditLimit && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setShowLimitModal(true);
                          }}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit credit limit"
                          aria-label={`Edit credit limit for ${customer.name}`}
                        >
                          ✏️
                        </button>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <Link
                      to={`/customers/${customer.id}`}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>

        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="shrink-0 border-t border-slate-200 px-3 py-2">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>

    {/* Edit Credit Limit Modal */}
    {canEditCustomerCreditLimit &&
      showLimitModal &&
      selectedCustomer && (
        <EditCreditLimitModal
          customer={selectedCustomer}
          onClose={() => {
            setShowLimitModal(false);
            setSelectedCustomer(null);
          }}
          onSuccess={loadCustomers}
        />
      )}

  </div>
);



}
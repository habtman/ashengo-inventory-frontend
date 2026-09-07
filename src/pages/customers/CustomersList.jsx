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
    <div className="p-6">

      <div className="flex justify-between mb-4">

        <h1 className="text-2xl font-bold">
          Customers
        </h1>

        {canCreateCustomer && (
          <Link
            to="/customers/new"
            className="
              bg-blue-600
              text-white
              px-4
              py-2
              rounded
            "
          >
            New Customer
          </Link>
        )}

      </div>

      <div className="p-6">

        <table className="w-full border">

          <thead>
            <tr>

              <th className="border p-2">
                Code
              </th>

              <th className="border p-2">
                Name
              </th>

              <th className="border p-2">
                Phone
              </th>

              <th className="border p-2">
                Credit Limit
              </th>

              <th className="border p-2">
                Actions
              </th>

            </tr>
          </thead>

          <tbody>

            {paginatedCustomers.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="border p-6 text-center text-gray-500"
                >
                  No customers found.
                </td>
              </tr>
            ) : (
              paginatedCustomers.map((customer) => (

                <tr key={customer.id}>

                  <td className="border p-2">
                    {customer.customer_code}
                  </td>

                  <td className="border p-2">
                    {customer.name}
                  </td>

                  <td className="border p-2">
                    {customer.phone}
                  </td>

                  <td className="border p-2">

                    <div className="flex items-center justify-between">

                      <span>
                        {formatCurrency(customer.credit_limit)}
                      </span>

                      {canEditCustomerCreditLimit && (
                        <button
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setShowLimitModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ✏️
                        </button>
                      )}

                    </div>

                  </td>

                  <td className="border p-2">

                    <Link
                      to={`/customers/${customer.id}`}
                      className="text-blue-600"
                    >
                      View
                    </Link>

                  </td>

                </tr>

              ))
            )}

          </tbody>

        </table>

        {totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}

      </div>

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
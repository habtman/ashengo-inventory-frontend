import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import customerApi from "../../api/customerApi";
import { formatCurrency } from "../../utils/currency";  
import EditCreditLimitModal from "./modals/EditCreditLimitModal";
import { hasPermission} from "../../utils/permissions";
 



export default function CustomersList() {
  const canCreateCustomer = hasPermission("customers.create");
  const canEditCustomerCreditLimit = hasPermission("customers.manage_credit");

  const [customers, setCustomers] =
    useState([]);

  const [selectedCustomer, setSelectedCustomer] =
    useState(null);

  const [showLimitModal, setShowLimitModal] =
    useState(false);

  const loadCustomers = async () => {
    const data =
      await customerApi.getAll();

    setCustomers(data);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

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

          {customers.map(customer => (

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

          ))}

        </tbody>

      </table>

      {canEditCustomerCreditLimit && showLimitModal && selectedCustomer && (
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
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { formatCurrency } from "../../utils/currency";
import Pagination from "../../pages/customers/Pagination";

const PAGE_SIZE = 10;

export default function CustomerCreditTable({ customers = [] }) {

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("ALL");

  const [page, setPage] = useState(1);

  const filteredCustomers = useMemo(() => {

    return customers.filter(customer => {

      const matchesSearch =
        customer.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||

        customer.customer_code
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        status === "ALL"
          ? true
          : customer.status === status;

      return matchesSearch && matchesStatus;

    });

  }, [customers, search, status]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCustomers.length / PAGE_SIZE)
  );

  const paginatedCustomers =
    filteredCustomers.slice(
      (page - 1) * PAGE_SIZE,
      page * PAGE_SIZE
    );

  return (

    <>

      <div className="flex gap-4 mb-5">

        <input
          placeholder="Search customer..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="border rounded p-2 w-80"
        />

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="border rounded p-2"
        >

          <option value="ALL">All</option>

          <option value="CLEAR">Clear</option>

          <option value="ACTIVE">Active</option>

          <option value="WARNING">Warning</option>

          <option value="OVER_LIMIT">Over Limit</option>

        </select>

      </div>

      <div className="overflow-x-auto rounded-lg border bg-white shadow">

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="p-3 text-left">Customer</th>

              <th className="p-3 text-left">Code</th>

              <th className="p-3 text-right">Credit Limit</th>

              <th className="p-3 text-right">Outstanding</th>

              <th className="p-3 text-right">Available</th>

              <th className="p-3 text-center">% Used</th>


            </tr>

          </thead>

          <tbody>

            {paginatedCustomers.map(customer => (

              <tr
                key={customer.id}
                className="border-t hover:bg-gray-50"
              >

                <td className="p-3">

                    <Link
                        to={`/customers/${customer.id}`}
                        className="
                        font-semibold
                        text-blue-600
                        hover:text-blue-800
                        hover:underline
                        "
                    >
                        {customer.name}
                    </Link>

                </td>

                <td className="p-3">
                  {customer.customer_code}
                </td>

                <td className="p-3 text-right">
                  {formatCurrency(customer.credit_limit)}
                </td>

                <td className="p-3 text-right text-orange-600 font-semibold">
                  {formatCurrency(customer.outstanding)}
                </td>

                <td className="p-3 text-right text-green-600 font-semibold">
                  {formatCurrency(customer.available_credit)}
                </td>

                <td className="p-3 w-72">

                <div className="flex justify-between items-center mb-2">

                    <span className="font-semibold">
                    {customer.utilization_percent}%
                    </span>

                    <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold

                    ${
                        customer.status === "OVER_LIMIT"

                        ? "bg-red-100 text-red-700"

                        : customer.status === "WARNING"

                        ? "bg-yellow-100 text-yellow-700"

                        : customer.status === "ACTIVE"

                        ? "bg-blue-100 text-blue-700"

                        : "bg-green-100 text-green-700"

                    }`}
                    >
                    {customer.status.replace("_", " ")}
                    </span>

                </div>

                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">

                    <div
                    className={`h-3 transition-all duration-500

                    ${
                        customer.status === "OVER_LIMIT"

                        ? "bg-red-600"

                        : customer.status === "WARNING"

                        ? "bg-yellow-500"

                        : "bg-green-600"

                    }`}
                    style={{
                        width: `${Math.min(
                        Number(customer.utilization_percent),
                        100
                        )}%`
                    }}
                    />

                </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      <div className="mt-5">

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />

      </div>

    </>

  );

}
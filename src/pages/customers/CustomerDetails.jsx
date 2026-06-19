import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import customerApi from "../../api/customerApi";

export default function CustomerDetails() {

  const { id } = useParams();

  const [customer, setCustomer] =
    useState(null);

  useEffect(() => {

    const load = async () => {

      const data =
        await customerApi.getById(id);

      setCustomer(data);
    };

    load();

  }, [id]);

  if (!customer)
    return <div>Loading...</div>;

  return (

    <div className="p-6">

      <h1 className="text-2xl font-bold mb-4">
        {customer.name}
      </h1>

      <p>
        Code:
        {" "}
        {customer.customer_code}
      </p>

      <p>
        Phone:
        {" "}
        {customer.phone}
      </p>

      <p>
        Email:
        {" "}
        {customer.email}
      </p>

      <p>
        Address:
        {" "}
        {customer.address}
      </p>

      <p>
        Credit Limit:
        {" "}
        {customer.credit_limit}
      </p>

    </div>
  );
}
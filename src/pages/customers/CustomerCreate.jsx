import { useState } from "react";
import { useNavigate } from "react-router-dom";

import customerApi from "../../api/customerApi";

export default function CustomerCreate() {

  const navigate = useNavigate();

  const [form, setForm] =
    useState({
      name:"",
      phone:"",
      email:"",
      address:"",
      creditLimit:0
    });

  const handleChange = e => {

    setForm({
      ...form,
      [e.target.name]:
      e.target.value
    });
  };

  const handleSubmit =
    async e => {

      e.preventDefault();

      await customerApi.create(form);

      navigate("/customers");
    };

  return (

    <div className="p-6 max-w-xl">

      <h1 className="text-2xl font-bold mb-4">
        New Customer
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >

        <input
          name="name"
          placeholder="Customer Name"
          onChange={handleChange}
          className="border p-2 w-full"
        />

        <input
          name="phone"
          placeholder="Phone"
          onChange={handleChange}
          className="border p-2 w-full"
        />

        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className="border p-2 w-full"
        />

        <input
          name="address"
          placeholder="Address"
          onChange={handleChange}
          className="border p-2 w-full"
        />

        <input
          name="creditLimit"
          type="number"
          placeholder="Credit Limit"
          onChange={handleChange}
          className="border p-2 w-full"
        />

        <button
          type="submit"
          className="
            bg-blue-600
            text-white
            px-4
            py-2
            rounded
          "
        >
          Save
        </button>

      </form>

    </div>
  );
}
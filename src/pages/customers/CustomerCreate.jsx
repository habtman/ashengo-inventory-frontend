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
  <div className="p-4">
    <div className="max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-800">
          New Customer
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Enter the customer details below.
        </p>
      </div>

      {/* Form */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5"> 
                Customer Name 
                <span className="text-red-500">*</span> </label>
              <input
                name="name"
                placeholder="Enter customer name"
                onChange={handleChange}
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Phone
              </label>
              <input
                name="phone"
                type="tel"
                placeholder="Enter phone number"
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                name="email"
                type="email"
                placeholder="Enter email address"
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Credit Limit
              </label>
              <input
                name="creditLimit"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-500 mt-1.5"> 
                Set the maximum credit this customer can use. 
              </p>
            </div>
          </div>

          {/* Row 3 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Address
            </label>
            <textarea
              name="address"
              placeholder="Enter customer address"
              onChange={handleChange}
              rows={2}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
            >
              Save Customer
            </button>
          </div>

        </form>
      </div>
    </div>
  </div>
);


}
import { useEffect, useState } from "react";
import supplierApi from "../../api/supplierApi";
import locationsApi from "../../api/locationsApi";

export default function GRNFilters({

  search,
  setSearch,

  supplier,
  setSupplier,

  warehouse,
  setWarehouse,

  dateFrom,
  setDateFrom,

  dateTo,
  setDateTo,

  setPage

}) {

  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  useEffect(() => {

    const load = async () => {

      try {

        const supplierData =
          await supplierApi.getAll();

        setSuppliers(supplierData);

        const warehouseData =
          await locationsApi.getLocations();    

        setWarehouses(warehouseData);

      } catch (err) {

        console.error(err);

      }

    };

    load();

  }, []);

  return (

    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">

      <input
        type="text"
        placeholder="Search GRN / PO / Supplier..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="border rounded px-3 py-2"
      />

      <select
        value={supplier}
        onChange={(e) => {
          setSupplier(e.target.value);
          setPage(1);
        }}
        className="border rounded px-3 py-2"
      >
        <option value="">All Suppliers</option>

        {suppliers.map((s) => (

          <option
            key={s.id}
            value={s.id}
          >
            {s.supplier_code} - {s.supplier_name}
          </option>

        ))}

      </select>

      <select
        value={warehouse}
        onChange={(e) => {
          setWarehouse(e.target.value);
          setPage(1);
        }}
        className="border rounded px-3 py-2"
      >
        <option value="">All Warehouses</option>

        {warehouses.map((w) => (

          <option
            key={w.id}
            value={w.id}
          >
            {w.name}
          </option>

        ))}

      </select>

      <input
        type="date"
        value={dateFrom}
        onChange={(e) => {
          setDateFrom(e.target.value);
          setPage(1);
        }}
        className="border rounded px-3 py-2"
      />

      <input
        type="date"
        value={dateTo}
        onChange={(e) => {
          setDateTo(e.target.value);
          setPage(1);
        }}
        className="border rounded px-3 py-2"
      />

    </div>

  );

}
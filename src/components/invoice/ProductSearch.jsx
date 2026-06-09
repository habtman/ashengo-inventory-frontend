import { useState } from "react";


export default function ProductSearch({
  inventory,
  onAdd
}) {

  const [search,setSearch] = useState("");

  const filtered =
    inventory?.filter(p =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase())
    ) || [];

  return (
    <div>

      <input
        placeholder="Search SKU or Product..."
        className="border p-2 w-full"
        value={search}
        onChange={(e)=>setSearch(e.target.value)}
      />

      <div className="border max-h-40 overflow-y-auto">

        {filtered.map(product => (
          <div
            key={product.id}
            className="p-2 hover:bg-gray-100 cursor-pointer"
            onClick={()=>onAdd(product)}
          >
            {product.name} | {product.sku}
          </div>
        ))}

      </div>

    </div>
  );
}

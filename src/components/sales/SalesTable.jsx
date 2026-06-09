export default function SalesTable({ sales, loading }) {

   

  if (loading) {
    return (
      <div className="p-6 text-sm text-slate-500">
        Loading sales...
      </div>
    );
  }

  if (!sales.length) {
    return (
      <div className="p-6 text-sm text-slate-500">
        No sales found
      </div>
    );
  }

  return (
    <table className="w-full text-sm">

<thead className="bg-slate-100 text-left">
  <tr>
    <th className="p-3">SKU</th>
    <th className="p-3">Item</th>
    <th className="p-3">Location</th>
    <th className="p-3">Qty</th>
    <th className="p-3">Unit Price</th>
    <th className="p-3">Total</th>
    <th className="p-3">Sold To</th>
    <th className="p-3">Sold By</th>
    <th className="p-3">Date</th>
  </tr>
</thead>


<tbody>
  {sales.map((sale) => (
<tr key={sale.id}>
  {/* SKU */}
  <td>{sale.sku}</td>

  {/* Item */}
  <td>{sale.inventory_name}</td>

  {/* Location */}
  <td>{sale.location_name}</td>

  {/* Quantity */}
  <td>{sale.quantity}</td>

  {/* Unit Price */}
  <td>${Number(sale.selling_price).toFixed(2)}</td>

  {/* Total */}
  <td>${Number(sale.total_amount).toFixed(2)}</td>

  {/* Sold To */}
  <td>{sale.sold_to}</td>

  {/* Sold By */}
  <td>{sale.user_email}</td>

  {/* Date */}
  <td>
    {new Date(sale.created_at).toLocaleString()}
  </td>
</tr>


  ))}
</tbody>


    </table>
  );
}

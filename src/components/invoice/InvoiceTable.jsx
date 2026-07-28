import { formatCurrency } from "../../utils/currency";  

export default function InvoiceTable({
  items,
  setItems
}) {

  const updateQty = (id, qty) => {
    setItems(items.map(i =>
      i.itemId === id
        ? { ...i, quantity: Number(qty) }
        : i
    ));
  };

  const updateItemPrice = (id, price) => {
    setItems(items.map(i =>
      i.itemId === id
        ? { ...i, sellingPrice: price }
        : i
    ));
  };
  

  const removeItem = (id) => {
    setItems(items.filter(
      i => i.itemId !== id
    ));
  };

  return (
    <table className="w-full border">

      <thead>
        <tr className="bg-gray-200">
          <th>SKU</th>
          <th>Item</th>
          <th>Qty</th>
          <th>Price</th>
          <th>Total</th>
          <th/>
        </tr>
      </thead>

      <tbody>

        {(items || []).map(item => (

          <tr key={item.itemId}>
            <td>{item.sku}</td>
            <td>{item.name}</td>

            <td>
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e)=>
                  updateQty(
                    item.itemId,
                    e.target.value
                  )
                }
              />
            </td>

            <td>
              <input
                type="number"
                value={formatCurrency(item.sellingPrice)}
                onChange={(e) =>
                  updateItemPrice(item.itemId, Number(e.target.value))
                }
              />

            </td>

            <td>
              {formatCurrency(item.quantity *
               item.sellingPrice)}
            </td>

            <td>
              <button
                onClick={()=>removeItem(item.itemId)}
              >
                ❌
              </button>
            </td>

          </tr>
        ))}

      </tbody>

    </table>
  );
}

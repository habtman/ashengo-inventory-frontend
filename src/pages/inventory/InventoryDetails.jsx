import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { inventoryApi } from "../../api/inventoryApi";

export default function InventoryDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [stock, setStock] = useState([]);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  const load = async () => {
    try {
      console.log("Loading product", id);

      const productData =
        await inventoryApi.getById(id);

      console.log("Product:", productData);

      const stockData =
        await inventoryApi.getStockByLocation(id);

      console.log("Stock:", stockData);

      const movementData =
        await inventoryApi.getMovements(id);

      console.log("Movements:", movementData);

      setProduct(productData);
      setStock(stockData);
      setMovements(movementData);

    } catch (err) {
      console.error("LOAD ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  load();
}, [id]);

useEffect(() => {
    const load = async () => {
      try {
        const [
          productData,
          stockData,
          movementData
        ] = await Promise.all([
          inventoryApi.getById(id),
          inventoryApi.getStockByLocation(id),
          inventoryApi.getMovements(id)
        ]);

        setProduct(productData);
        setStock(stockData);
        setMovements(movementData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);



  if (loading) {
    return (
      <div className="p-6">
        Loading...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6">
        Product not found
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          {product.name}
        </h1>

        <p className="text-gray-500">
          SKU: {product.sku}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">

        <div className="border rounded p-4">
          <div className="text-sm text-gray-500">
            Total Stock
          </div>

          <div className="text-2xl font-bold">
            {product.total_stock}
          </div>
        </div>

        <div className="border rounded p-4">
          <div className="text-sm text-gray-500">
            Selling Price
          </div>

          <div className="text-2xl font-bold">
            ${Number(product.price).toFixed(2)}
          </div>
        </div>

        <div className="border rounded p-4">
          <div className="text-sm text-gray-500">
            Cost Price
          </div>

          <div className="text-2xl font-bold">
            ${Number(product.cost_price).toFixed(2)}
          </div>
        </div>

        <div className="border rounded p-4">
          <div className="text-sm text-gray-500">
            Inventory Value
          </div>

          <div className="text-2xl font-bold">
            $
            {(
              Number(product.total_stock || 0) *
              Number(product.cost_price || 0)
            ).toFixed(2)}
          </div>
        </div>

      </div>

      {/* Stock by Location */}
      <div className="border rounded p-4">

        <h2 className="text-xl font-semibold mb-4">
          Stock By Location
        </h2>

        <table className="w-full">

          <thead>
            <tr className="border-b">
              <th className="text-left py-2">
                Location
              </th>

              <th className="text-left py-2">
                Quantity
              </th>
            </tr>
          </thead>

          <tbody>
            {stock.map(location => (
              <tr
                key={location.location_id}
                className="border-b"
              >
                <td className="py-2">
                  {location.location_name}
                </td>

                <td className="py-2">
                  {location.quantity}
                </td>
              </tr>
            ))}
          </tbody>

        </table>

      </div>

      {/* Movement History */}
      <div className="border rounded p-4">

        <h2 className="text-xl font-semibold mb-4">
          Movement History
        </h2>

        <table className="w-full">

          <thead>
            <tr className="border-b">
              <th className="text-left py-2">
                Date
              </th>

              <th className="text-left py-2">
                Type
              </th>

              <th className="text-left py-2">
                Quantity
              </th>

              <th className="text-left py-2">
                Details
              </th>
            </tr>
          </thead>

          <tbody>
            {movements.map(movement => (
              <tr
                key={movement.id}
                className="border-b"
              >
                <td className="py-2">
                  {new Date(
                    movement.created_at
                  ).toLocaleDateString()}
                </td>

                <td className="py-2">
                  {movement.movement_type}
                </td>

                <td className="py-2">
                  {movement.quantity}
                </td>

                <td className="py-2">
                  {movement.details || "-"}
                </td>
              </tr>
            ))}
          </tbody>

        </table>

      </div>

    </div>
  );
}
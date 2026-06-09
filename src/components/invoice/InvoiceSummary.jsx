export default function InvoiceSummary({
  items,
  loading,
  onSubmit
}) {

  const total =
    items.reduce(
      (sum,i)=>
        sum + i.quantity*i.sellingPrice,
      0
    );

  return (
    <div className="text-right space-y-3">

      <div className="text-xl font-bold">
        Total: {total.toFixed(2)}
      </div>

      <button
        disabled={loading}
        onClick={onSubmit}
        className="bg-blue-600 text-white px-6 py-2"
      >
        {loading
          ? "Creating..."
          : "Create Invoice"}
      </button>

    </div>
  );
}

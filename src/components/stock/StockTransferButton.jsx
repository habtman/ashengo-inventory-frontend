export default function StockTransferButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1 text-sm bg-indigo-600 text-white rounded"
    >
      Transfer Stock
    </button>
  );
}

export default function AddStockButton({ onClick }) {
return (
  <button
    onClick={onClick}
    className="px-3 py-1 text-sm bg-indigo-600 text-white rounded"
  >
    Add Stock
  </button>
);
}

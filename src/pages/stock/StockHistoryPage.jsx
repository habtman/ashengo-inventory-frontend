import StockHistoryTable from "../../components/stock-history/StockHistoryTable";


export default function StockHistoryPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Stock History</h1>
        <p className="text-sm text-slate-500">
          View all stock movements and audit logs
        </p>
      </div>

      <StockHistoryTable refreshKey={0} />
    </div>
  );
}

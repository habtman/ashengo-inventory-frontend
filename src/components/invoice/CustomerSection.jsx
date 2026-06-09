export default function CustomerSection({
  soldTo,
  setSoldTo
}) {
  return (
    <div>
      <label>Customer</label>
      <input
        className="border p-2 w-full"
        value={soldTo}
        onChange={(e)=>setSoldTo(e.target.value)}
        placeholder="Walk-in customer"
      />
    </div>
  );
}

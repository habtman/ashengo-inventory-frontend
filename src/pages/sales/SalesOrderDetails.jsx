import { useParams } from "react-router-dom";

export default function SalesOrderDetails() {
  const { id } = useParams();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">
        Sales Order #{id}
      </h1>
    </div>
  );
}
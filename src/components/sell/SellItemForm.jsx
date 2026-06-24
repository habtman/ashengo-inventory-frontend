import { useNavigate } from "react-router-dom";

export default function SellItemForm({ product }) {
  const navigate = useNavigate();

<button
  onClick={() =>
    navigate(
      `/sales-orders/new?inventoryId=${product.id}`
    )
  }
>
  Sell
</button>
}
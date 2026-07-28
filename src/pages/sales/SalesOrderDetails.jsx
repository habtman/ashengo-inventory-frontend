import { useEffect, useState } from "react"; 
import { useParams, useNavigate } from "react-router-dom"; 
import salesOrderApi from "../../api/salesOrderApi";
import { formatCurrency } from "../../utils/currency";


export default function SalesOrderDetails() { 
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [so, setSo] = useState(null); 
  const [loading, setLoading] = useState(true); 
  const [confirming, setConfirming] = useState(false);

useEffect(() => {
  const fetchData = async () => {
    try {
      const data = await salesOrderApi.getById(id);
      setSo(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load Sales Order");
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [id]);

const handleConfirm = async () => { 
        try { 

        setConfirming(true);
        

    await salesOrderApi.confirm(id);
    alert("Sales Order confirmed"); 
    const data = await salesOrderApi.getById(id);
    setSo(data);

        } catch (err) {  
        alert(err.message || "Failed to confirm Sales Order");
        } finally {  
            setConfirming(false);}
        };

    const statusColor = {
      DRAFT: "bg-gray-500",
      CONFIRMED: "bg-green-600",
    };

    if (loading) {
      return <div>Loading…</div>;
    }

    if (!so) {
      return <div>Sales Order not found</div>;
    }

    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">    
            <button onClick={
                () => navigate("/sales-orders")}
            className="bg-gray-500 text-white px-4 py-2 rounded" > 
                 ← Back    
            </button>    
        <h2 className="text-2xl font-bold">
             Sales Order #{so.so_number} 
        </h2>  
        </div>

 <div className="grid grid-cols-2 gap-4 mb-6">
    <div>
       <p> 
        <strong>Customer:</strong>{" "}
        {so.customer_name}      
        </p>
      <p>
        <strong>Payment Method:</strong>
        {so.payment_method || "-"}  
      </p>

      <p>
        <strong>Credit Terms:</strong>
        {so.credit_days || "-"} Days
      </p>

      <p>
        <strong>Balance Due:</strong>{" "}
        {formatCurrency(so.balance_due)}
      </p> 
  

      <p>
        <strong>Due Date:</strong>{" "}
        {so.due_date
          ? new Date(so.due_date).toLocaleDateString("en-GB")
          : "-"}
      </p>

      <p>  
        <strong>Created:</strong>{" "}
            {new Date(so.created_at).toLocaleString()
            }  
        </p> 
    </div>  
    <div>  
        <p>
            <strong>Status:</strong>{" "}
              <span className={`px-3 py-1 text-white rounded ${statusColor[so.status]}
              `}>        
                {so.status}
              </span>
        </p>
        <p>   
            <strong>Confirmed By:</strong>{" "}
                {so.confirmed_by_name || "-"} 
        </p>
        <p>   
            <strong>Confirmed At:</strong>{" "}
                {so.confirmed_at ? new Date(so.confirmed_at).toLocaleString()
                    : "-"} 
         </p>  
      </div> 
     </div>
    

    <table className="w-full border border-collapse">   
        <thead className="bg-gray-100">
            <tr>        
                <th className="border p-2 text-left">
                    Item  
                </th>   
                <th className="border p-2">  
                  Quantity      
                </th>  
                <th className="border p-2"> 
                  Unit Price      
                </th>       
                <th className="border p-2">  
                     Line Total
                </th>      
                </tr> 
               </thead> 
        <tbody> 
             {so.items.map((item) => (
               <tr key={item.inventory_id}>      
                <td className="border p-2"> 
                      {item.item_name}        
                 </td>     
                 <td className="border p-2 text-center"> 
                      {item.quantity} 
                 </td>    
                 <td className="border p-2 text-right"> 
                    {formatCurrency(item.unit_price)} 
                 </td>   
                 <td className="border p-2 text-right">      
                     {formatCurrency(item.total_amount)}
                 </td>   
             </tr>  
         ))}   
          </tbody> 
      </table>

    <div className="text-right mt-6"> 
       <h3 className="text-xl font-bold"> 
         Total: {formatCurrency(so.total_amount)}
        </h3> 
    </div>


     <div className="flex justify-end gap-2 mt-6"> 
        {so.status === "DRAFT" && (
         <button
             onClick={handleConfirm}
             disabled={confirming}   
             className="bg-green-600 text-white px-4 py-2 rounded"> 
                {confirming ? "Confirming..." : "Confirm Sales Order"}
         </button> 
       )}  
         {so.status === "CONFIRMED" && (
         <button
            onClick={() =>
                window.open(
                `/sales-orders/${so.id}/print`,
                "_blank",
                "width=900,height=800"
                )
            }
            className="bg-blue-600 text-white px-4 py-2 rounded"
            >
            Print
            </button>
         )}
    </div>
</div>
); 
}






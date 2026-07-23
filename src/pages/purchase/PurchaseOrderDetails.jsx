import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import purchaseOrderApi from "../../api/purchaseOrderApi";
import { useAuth } from "../../context/useAuth";   
import locationsApi from "../../api/locationsApi";
import PurchaseOrderSummary from "../../components/purchase/PurchaseOrderSummary";
import PurchaseOrderProgress from "../../components/purchase/PurchaseOrderProgress";
import PurchaseOrderItemsTable from "../../components/purchase/PurchaseOrderItemsTable";
import PurchaseOrderReceiveModal from "../../components/purchase/PurchaseOrderReceiveModal";
import PurchaseOrderActions from "../../components/purchase/PurchaseOrderActions";




export default function PurchaseOrderDetails() {
    
  const { id } = useParams();

  const [po, setPo] = useState(null);
  const [showReceiveModal, setShowReceiveModal] = useState(false);

  const [receiveItems, setReceiveItems] = useState([]);
  const [receiving, setReceiving] = useState(false);
  const [locationId, setLocationId] = useState("");
  const [locations, setLocations] = useState([]);
  const navigate = useNavigate();

  const handlePrint = () => {
      navigate(`/purchase-orders/${po.id}/print`);
  };


   const { user } = useAuth();

    const [actionLoading, setActionLoading] = useState(false);
    const [modal, setModal] = useState(null); 
    const STATUS_COLORS = {
      DRAFT: "bg-gray-400",
      PENDING_APPROVAL: "bg-yellow-500",
      APPROVED: "bg-blue-600",
      PARTIALLY_RECEIVED: "bg-orange-500",
      RECEIVED: "bg-green-600",
      REJECTED: "bg-red-600",
    };
    
    // "submit" | "approve" | "reject" | null

  const load = useCallback(async () => {
    try {
      const data = await purchaseOrderApi.getById(id);
      setPo(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load purchase order");
    }
  }, [id]); 

  useEffect(() => {

    if (!id || id === ":id") return;

    load();

}, [id, load]);

useEffect(() => {
  const loadLocations = async () => {
    try {
      const data = await locationsApi.getLocations();
      setLocations(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load locations");
    }
  };

  loadLocations();
}, []);




  const { totalOrdered, totalReceived, progress } = useMemo(() => {

      if (!po) {
          return {
              totalOrdered: 0,
              totalReceived: 0,
              progress: 0
          };
      }

      const ordered = po.items.reduce(
          (sum, item) => sum + Number(item.quantity),
          0
      );

      const received = po.items.reduce(
          (sum, item) => sum + Number(item.received_quantity || 0),
          0
      );

      return {
          totalOrdered: ordered,
          totalReceived: received,
          progress:
              ordered > 0
                  ? Math.min(
                        100,
                        Math.round((received / ordered) * 100)
                    )
                  : 0
      };

  }, [po]);


const updateReceiveQty = useCallback((inventoryId, value) => {
  setReceiveItems(prev =>
    prev.map(item =>
      item.inventoryId === inventoryId
        ? {
            ...item,
            receiveNow: Number(value)
          }
        : item
    )
  );
}, []);


const openReceiveModal = useCallback(() => {
    if (!po) return;

    setReceiveItems(
        po.items.map(item => ({
            inventoryId: item.inventory_id,
            itemName: item.item_name,
            orderedQuantity: Number(item.quantity),
            receivedQuantity: Number(item.received_quantity || 0),
            receiveNow: 0
        }))
    );

    setShowReceiveModal(true);

}, [po]);


const handleReceive = useCallback(async () => {
  try {
    setReceiving(true);

    const items = receiveItems
      .filter(i => Number(i.receiveNow) > 0)
      .map(i => ({
        inventoryId: i.inventoryId,
        receivedQuantity: Number(i.receiveNow)
      }));

    if (!items.length) {
      alert("Enter at least one quantity");
      return;
    }
    if (!locationId) {
      alert("Please select a destination location.");
      return;
    }

    await purchaseOrderApi.receive(id, {
      locationId,
      items
    });

    await load();

    setShowReceiveModal(false);

    alert("Goods received successfully");

  } catch (err) {
    console.error(err);
    alert(err.message || "Failed to receive stock");
  } finally {
    setReceiving(false);
  }
}, [receiveItems, locationId, id, load]);




    const handleAction = useCallback(async (type) => {
      try {
        setActionLoading(true);

        if (type === "submit") {
          await purchaseOrderApi.submit(id);
        }

        if (type === "approve") {
          await purchaseOrderApi.approve(id);
        }

        if (type === "reject") {
          await purchaseOrderApi.reject(id);
        }

        await load(); // refresh PO
        setModal(null);

      } catch (err) {
          alert(err.message || "Action failed");
      } finally {
        setActionLoading(false);
      }
    }, [id, load]);

      if (!id) {
        return (
          <div className="p-10 text-center">
            <h2 className="text-xl font-semibold">
              Invalid Purchase Order
            </h2>
            <p className="text-gray-500 mt-2">
              The purchase order ID is invalid.
            </p>
          </div>
        );
      }

      if (!po) {
        return (
          <div className="p-10 text-center text-gray-500">
            Loading purchase order...
          </div>
        );
      }


  return (
    <div className="print-area">

      <PurchaseOrderSummary
        po={po}
        statusColor={STATUS_COLORS}
      />



    <PurchaseOrderProgress

      totalOrdered={totalOrdered}

      totalReceived={totalReceived}

      progress={progress}

    />

    <PurchaseOrderItemsTable
      items={po.items}
    />

    <PurchaseOrderReceiveModal
      open={showReceiveModal}
      onClose={() => setShowReceiveModal(false)}
      locations={locations}
      locationId={locationId}
      setLocationId={setLocationId}
      receiveItems={receiveItems}
      updateReceiveQty={updateReceiveQty}
      handleReceive={handleReceive}
      receiving={receiving}
      totalOrdered={totalOrdered}
      totalReceived={totalReceived}
      progress={progress}
    />

    <PurchaseOrderActions
        po={po}
        user={user}
        statusColor={STATUS_COLORS}
        progress={progress}
        totalOrdered={totalOrdered}
        totalReceived={totalReceived}
        actionLoading={actionLoading}
        modal={modal}
        setModal={setModal}
        handleAction={handleAction}
        onReceive={openReceiveModal}  
        onPrint ={handlePrint}
        

    />


    </div>

  );
}

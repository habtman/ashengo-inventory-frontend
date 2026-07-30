import { useEffect, useState } from "react";
import customerApi from "../../api/customerApi";

import InvoiceLedgerTable from "./ledger/InvoiceLedgerTable";
import PaymentLedgerTable from "./ledger/PaymentLedgerTable";
import StatementLedgerTable from "./ledger/StatementLedgerTable";

export default function CustomerLedger({ customerId, mode }) {
  const [ledger, setLedger] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await customerApi.getLedger(customerId);
        setLedger(data);
      } catch (err) {
        console.error(err);
      }
    };

    if (customerId) {
      load();
    }
  }, [customerId]);

  if (!ledger) return null;

  return (
    <div className="mt-8">

      {mode === "invoices" && (
        <InvoiceLedgerTable
          invoices={ledger.invoices || []}
        />
      )}

      {mode === "payments" && (
        <PaymentLedgerTable
          payments={ledger.payments || []}
        />
      )}

      {mode === "statement" && (
        <StatementLedgerTable
          statement={ledger.statement || []}
        />
      )}

    </div>
  );
}
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency } from "./currency";

export function exportInvoicesExcel(invoices) {
  const rows = invoices.map(inv => ({
    Invoice: inv.invoice_number,
    Customer: inv.customer_name,
    Payment: inv.payment_method,
    Status: inv.status,
    Total: inv.total_amount,
    Paid: inv.amount_paid,
    Balance: inv.balance_due,
    DueDate: inv.due_date
      ? new Date(inv.due_date).toLocaleDateString()
      : "",
    Created:
      new Date(inv.created_at).toLocaleDateString(),
  }));

  const worksheet =
    XLSX.utils.json_to_sheet(rows);

  const workbook =
    XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Invoices"
  );

  XLSX.writeFile(
    workbook,
    "Invoices.xlsx"
  );
}

export function exportInvoicesPDF(invoices) {
  const doc = new jsPDF();

  doc.setFontSize(18);

  doc.text("Invoices", 14, 18);

  autoTable(doc, {
    startY: 28,

    head: [[
      "Invoice",
      "Customer",
      "Status",
      "Total",
      "Paid",
      "Balance"
    ]],

    body: invoices.map(inv => [
      inv.invoice_number,
      inv.customer_name,
      inv.status,
      formatCurrency(inv.total_amount),
      formatCurrency(inv.amount_paid),
      formatCurrency(inv.balance_due),
    ])
  });

  doc.save("Invoices.pdf");
}
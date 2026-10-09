import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency } from "./currency";

export function exportInvoicesExcel(invoices) {
  const headers = [
    "Invoice",
    "Customer",
    "Payment",
    "Status",
    "Total",
    "Paid",
    "Balance",
    "DueDate",
    "Created"
  ];  

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

  const worksheet = XLSX.utils.aoa_to_sheet(
    [
      headers,
      ...rows,
    ]);    

//set readable column widths

    worksheet["!cols"] = [
      { wch: 22 }, // Invoice
      { wch: 28 }, // Customer
      { wch: 18 }, // Payment
      { wch: 18 }, // Status
      { wch: 16 }, // Total
      { wch: 16 }, // Paid
      { wch: 16 }, // Balance
      { wch: 16 }, // DueDate
      { wch: 16 }, // Created 
    ]

    const lastRow = rows.length 
    //Excels's built-in autosilter
    if (lastRow > 0) {
      worksheet["!autofilter"] = {
        ref: `A1:I${lastRow + 1}`,
      };
    } 

    //Format amount columns and dates
for (let r = 1; r <= lastRow; r++) 
  { for (const c of [4, 5, 6]) 
    { const address = XLSX.utils.encode_cell({ r, c });
     if (worksheet[address]) 
      { worksheet[address].z = "#,##0.00;[Red]-#,##0.00";

       } }


  for (const c of [7, 8]) 
    {
       const address = XLSX.utils.encode_cell({ r, c }); 
       const cell = worksheet[address]; 
       if (cell && cell.v instanceof Date)
         { cell.z = "dd-mmm-yyyy"; 
          }
        }
      }


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

export function exportInvoicesCSV(invoices) {

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
    "Invoices.csv",
    {
      bookType: "csv",
    }
  );
}
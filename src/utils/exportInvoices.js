import * as XLSX from "xlsx-js-style";
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
    "Created",
  ];

  const rows = invoices.map((inv) => [
    inv.invoice_number || "",
    inv.customer_name || "",
    inv.payment_method || "",
    inv.status || "",
    Number(inv.total_amount || 0),
    Number(inv.amount_paid || 0),
    Number(inv.balance_due || 0),
    inv.due_date ? new Date(inv.due_date) : "",
    inv.created_at ? new Date(inv.created_at) : "",
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet([
    headers,
    ...rows,
  ]);

  // Column widths
  worksheet["!cols"] = [
    { wch: 22 },
    { wch: 28 },
    { wch: 18 },
    { wch: 20 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
  ];

  const lastRow = rows.length + 1;

  // Excel filter dropdowns
  if (rows.length > 0) {
    worksheet["!autofilter"] = {
      ref: `A1:I${lastRow}`,
    };
  }

  // Freeze the header row
  worksheet["!freeze"] = {
    xSplit: 0,
    ySplit: 1,
    topLeftCell: "A2",
    activePane: "bottomLeft",
    state: "frozen",
  };

  // Header styling
  for (let c = 0; c < headers.length; c++) {
    const cellAddress = XLSX.utils.encode_cell({
      r: 0,
      c,
    });

    worksheet[cellAddress].s = {
      font: {
        bold: true,
        color: { rgb: "FFFFFF" },
        sz: 11,
      },
      fill: {
        patternType: "solid",
        fgColor: { rgb: "1D4ED8" },
      },
      alignment: {
        horizontal: "center",
        vertical: "center",
        wrapText: true,
      },
      border: {
        top: { style: "thin", color: { rgb: "1E40AF" } },
        bottom: { style: "thin", color: { rgb: "1E40AF" } },
        left: { style: "thin", color: { rgb: "D1D5DB" } },
        right: { style: "thin", color: { rgb: "D1D5DB" } },
      },
    };
  }

  // Header row height
  worksheet["!rows"] = [{ hpt: 25 }];

  // Body styling and number/date formats
  for (let r = 1; r < lastRow; r++) {
    for (let c = 0; c < headers.length; c++) {
      const address = XLSX.utils.encode_cell({
        r,
        c,
      });

      const cell = worksheet[address];
      if (!cell) continue;

      cell.s = {
        font: {
          name: "Arial",
          sz: 10,
          color: { rgb: "1F2937" },
        },
        fill: {
          patternType: "solid",
          fgColor: {
            rgb: r % 2 === 0 ? "EFF6FF" : "FFFFFF",
          },
        },
        alignment: {
          vertical: "center",
          horizontal: c >= 4 && c <= 6 ? "right" : "left",
        },
        border: {
          bottom: {
            style: "thin",
            color: { rgb: "E5E7EB" },
          },
        },
      };

      // Total, Paid, Balance
      if ([4, 5, 6].includes(c)) {
        cell.z = "#,##0.00;[Red]-#,##0.00";
      }

      // DueDate and Created
      if ([7, 8].includes(c) && cell.v instanceof Date) {
        cell.z = "dd-mmm-yyyy";
      }

      // Highlight overdue status
      if (c === 3 && String(cell.v).toUpperCase() === "OVERDUE") {
        cell.s.font = {
          name: "Arial",
          sz: 10,
          bold: true,
          color: { rgb: "DC2626" },
        };
      }
    }

    worksheet["!rows"].push({ hpt: 20 });
  }

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Invoices"
  );

  XLSX.writeFile(workbook, "Invoices.xlsx");
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
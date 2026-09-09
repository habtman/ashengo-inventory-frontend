import * as XLSX from "xlsx";

function toNumber(value) {
  return Number(value || 0);
}

function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString();
}

function setColumnWidths(sheet, widths) {
  sheet["!cols"] = widths.map((width) => ({
    wch: width
  }));
}

function styleHeader(sheet, range) {
  const rows = XLSX.utils.decode_range(range);

  for (let row = rows.s.r; row <= rows.e.r; row++) {
    for (let col = rows.s.c; col <= rows.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({
        r: row,
        c: col
      });

      const cell = sheet[cellAddress];

      if (!cell) continue;

      cell.s = {
        font: {
          bold: true,
          color: { rgb: "FFFFFF" }
        },
        fill: {
          fgColor: { rgb: "1F4E78" }
        },
        alignment: {
          horizontal: "center",
          vertical: "center"
        }
      };
    }
  }
}

function formatCurrencyColumns(sheet, columns) {
  const range = XLSX.utils.decode_range(
    sheet["!ref"] || "A1:A1"
  );

  for (const column of columns) {
    for (let row = range.s.r; row <= range.e.r; row++) {
      const address = XLSX.utils.encode_cell({
        r: row,
        c: column
      });

      const cell = sheet[address];

      if (cell && typeof cell.v === "number") {
        cell.z = '#,##0.00';
      }
    }
  }
}

export function exportCustomerReport({
  customer,
  ledger,
  statement
}) {
  const workbook = XLSX.utils.book_new();

  const invoices = ledger?.invoices || [];
  const payments = ledger?.payments || [];
  const statementRows = statement || [];

  /*
   * ============================
   * SUMMARY CALCULATIONS
   * ============================
   */

  const outstanding = invoices.reduce(
    (sum, invoice) =>
      sum + toNumber(invoice.balance_due),
    0
  );

  const totalPaid = payments.reduce(
    (sum, payment) =>
      sum + toNumber(payment.amount),
    0
  );

  const availableCredit =
    toNumber(customer?.credit_limit) - outstanding;

  /*
   * ============================
   * CUSTOMER SHEET
   * ============================
   */

  const customerData = [
    ["CUSTOMER FINANCIAL REPORT"],
    [],
    ["Customer Information"],
    ["Customer Code", customer?.customer_code || ""],
    ["Customer Name", customer?.name || ""],
    ["Phone", customer?.phone || ""],
    ["Email", customer?.email || ""],
    ["Address", customer?.address || ""],
    [],
    ["Financial Summary"],
    ["Credit Limit", toNumber(customer?.credit_limit)],
    ["Outstanding", outstanding],
    ["Available Credit", availableCredit],
    ["Total Paid", totalPaid],
    [],
    ["Report Generated", new Date().toLocaleString()]
  ];

  const customerSheet =
    XLSX.utils.aoa_to_sheet(customerData);

  customerSheet["A1"].s = {
    font: {
      bold: true,
      size: 16,
      color: { rgb: "FFFFFF" }
    },
    fill: {
      fgColor: { rgb: "1F4E78" }
    }
  };

  customerSheet["A3"].s = {
    font: {
      bold: true,
      color: { rgb: "FFFFFF" }
    },
    fill: {
      fgColor: { rgb: "5B9BD5" }
    }
  };

  customerSheet["A10"].s = {
    font: {
      bold: true,
      color: { rgb: "FFFFFF" }
    },
    fill: {
      fgColor: { rgb: "5B9BD5" }
    }
  };

  setColumnWidths(customerSheet, [28, 32]);

  formatCurrencyColumns(
    customerSheet,
    [1]
  );

  XLSX.utils.book_append_sheet(
    workbook,
    customerSheet,
    "Customer"
  );

  /*
   * ============================
   * INVOICES SHEET
   * ============================
   */

  const invoiceData = invoices.map((invoice) => ({
    Invoice: invoice.invoice_number || "",
    Date: formatDate(invoice.created_at),
    Payment: invoice.payment_method || "",
    "Due Date":
      invoice.payment_method === "CREDIT" &&
      invoice.due_date
        ? formatDate(invoice.due_date)
        : "",
    Amount: toNumber(invoice.total_amount),
    Paid: toNumber(invoice.amount_paid),
    Balance: toNumber(invoice.balance_due),
    Status: invoice.status || ""
  }));

  const invoiceSheet =
    XLSX.utils.json_to_sheet(invoiceData);

  if (!invoiceData.length) {
    XLSX.utils.sheet_add_aoa(
      invoiceSheet,
      [["No invoices found."]]
    );
  }

  setColumnWidths(invoiceSheet, [
    22,
    15,
    18,
    15,
    16,
    16,
    16,
    20
  ]);

  if (invoiceData.length) {
    styleHeader(
      invoiceSheet,
      "A1:H1"
    );

    invoiceSheet["!autofilter"] = {
      ref: `A1:H${invoiceData.length + 1}`
    };

    formatCurrencyColumns(
      invoiceSheet,
      [4, 5, 6]
    );
  }

  XLSX.utils.book_append_sheet(
    workbook,
    invoiceSheet,
    "Invoices"
  );

  /*
   * ============================
   * PAYMENTS SHEET
   * ============================
   */

  const paymentData = payments.map((payment) => ({
    Date: formatDate(
      payment.payment_date ||
      payment.created_at
    ),
    Invoice: payment.invoice_number || "",
    Amount: toNumber(payment.amount),
    Method: payment.payment_method || ""
  }));

  const paymentSheet =
    XLSX.utils.json_to_sheet(paymentData);

  if (!paymentData.length) {
    XLSX.utils.sheet_add_aoa(
      paymentSheet,
      [["No payments found."]]
    );
  }

  setColumnWidths(paymentSheet, [
    18,
    22,
    18,
    18
  ]);

  if (paymentData.length) {
    styleHeader(
      paymentSheet,
      "A1:D1"
    );

    paymentSheet["!autofilter"] = {
      ref: `A1:D${paymentData.length + 1}`
    };

    formatCurrencyColumns(
      paymentSheet,
      [2]
    );
  }

  XLSX.utils.book_append_sheet(
    workbook,
    paymentSheet,
    "Payments"
  );

  /*
   * ============================
   * STATEMENT SHEET
   * ============================
   */

  let runningBalance = 0;

  const statementData = statementRows.map((row) => {
    const debit = toNumber(row.debit);
    const credit = toNumber(row.credit);

    runningBalance += debit - credit;

    if (Math.abs(runningBalance) < 0.005) {
      runningBalance = 0;
    }

    runningBalance = Number(
      runningBalance.toFixed(2)
    );

    return {
      Date: formatDate(row.date),
      Type: row.type || "",
      Reference: row.reference || "",
      Debit: debit,
      Credit: credit,
      Balance: runningBalance
    };
  });

  const statementSheet =
    XLSX.utils.json_to_sheet(statementData);

  if (!statementData.length) {
    XLSX.utils.sheet_add_aoa(
      statementSheet,
      [["No statement entries found."]]
    );
  }

  setColumnWidths(statementSheet, [
    18,
    18,
    25,
    18,
    18,
    18
  ]);

  if (statementData.length) {
    styleHeader(
      statementSheet,
      "A1:F1"
    );

    statementSheet["!autofilter"] = {
      ref: `A1:F${statementData.length + 1}`
    };

    formatCurrencyColumns(
      statementSheet,
      [3, 4, 5]
    );
  }

  XLSX.utils.book_append_sheet(
    workbook,
    statementSheet,
    "Statement"
  );

  /*
   * ============================
   * FILE NAME
   * ============================
   */

  const safeName =
    (customer?.name || "customer")
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase();

  XLSX.writeFile(
    workbook,
    `${safeName}-customer-report.xlsx`
  );
}
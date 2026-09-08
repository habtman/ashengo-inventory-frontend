import * as XLSX from "xlsx";

function toNumber(value) {
  return Number(value || 0);
}

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString();
}

export function exportCustomerReport({
  customer,
  ledger,
  statement,
}) {
  const workbook = XLSX.utils.book_new();

  const invoices = ledger?.invoices || [];
  const payments = ledger?.payments || [];
  const statementRows = statement || [];

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
   * CUSTOMER SHEET
   */
  const customerData = [
    ["Customer Report"],
    [],
    ["Customer Code", customer?.customer_code || ""],
    ["Customer Name", customer?.name || ""],
    ["Phone", customer?.phone || ""],
    ["Email", customer?.email || ""],
    ["Address", customer?.address || ""],
    ["Credit Limit", toNumber(customer?.credit_limit)],
    ["Outstanding", outstanding],
    ["Available Credit", availableCredit],
    ["Total Paid", totalPaid],
  ];

  const customerSheet =
    XLSX.utils.aoa_to_sheet(customerData);

  XLSX.utils.book_append_sheet(
    workbook,
    customerSheet,
    "Customer"
  );

  /*
   * INVOICES SHEET
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
    Status: invoice.status || "",
  }));

  const invoiceSheet = XLSX.utils.json_to_sheet(
    invoiceData.length
      ? invoiceData
      : [{
          Invoice: "",
          Date: "",
          Payment: "",
          "Due Date": "",
          Amount: 0,
          Paid: 0,
          Balance: 0,
          Status: "",
        }]
  );

  XLSX.utils.book_append_sheet(
    workbook,
    invoiceSheet,
    "Invoices"
  );

  /*
   * PAYMENTS SHEET
   */
  const paymentData = payments.map((payment) => ({
    Date: formatDate(
      payment.payment_date ||
      payment.created_at
    ),
    Invoice: payment.invoice_number || "",
    Amount: toNumber(payment.amount),
    Method: payment.payment_method || "",
  }));

  const paymentSheet = XLSX.utils.json_to_sheet(
    paymentData.length
      ? paymentData
      : [{
          Date: "",
          Invoice: "",
          Amount: 0,
          Method: "",
        }]
  );

  XLSX.utils.book_append_sheet(
    workbook,
    paymentSheet,
    "Payments"
  );

  /*
   * STATEMENT SHEET
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
      Balance: runningBalance,
    };
  });

  const statementSheet = XLSX.utils.json_to_sheet(
    statementData.length
      ? statementData
      : [{
          Date: "",
          Type: "",
          Reference: "",
          Debit: 0,
          Credit: 0,
          Balance: 0,
        }]
  );

  XLSX.utils.book_append_sheet(
    workbook,
    statementSheet,
    "Statement"
  );

  /*
   * DOWNLOAD
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
import Papa from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * CSV EXPORT
 */
export const exportToCSV = (data, filename = "export.csv") => {
  const csv = Papa.unparse(data);

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;

  link.click();
};

/**
 * PDF EXPORT
 */
export const exportToPDF = (columns, rows, filename = "export.pdf") => {
  const doc = new jsPDF();

  autoTable(doc, {
    head: [columns],
    body: rows,
  });

  doc.save(filename);
};

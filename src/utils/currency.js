export const formatCurrency = (value) => {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "ETB 0.00";
  }

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "ETB",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
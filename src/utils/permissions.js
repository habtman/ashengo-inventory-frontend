export function getPermissions() {
  try {
    return JSON.parse(localStorage.getItem("permissions")) || [];
  } catch {
    return [];
  }
}

export function hasPermission(permission) {
  return getPermissions().includes(permission);
}

export function hasAnyPermission(...permissions) {
  const userPermissions = getPermissions();

  return permissions.some((permission) =>
    userPermissions.includes(permission)
  );
}

export function getDefaultRoute() {
  const permissions = getPermissions();

  if (permissions.includes("inventory.view")) {
    return "/inventory";
  }

  if (permissions.includes("sales_orders.view")) {
    return "/sales-orders";
  }

  if (permissions.includes("customers.view")) {
    return "/customers";
  }

  if (permissions.includes("purchase_orders.view")) {
    return "/purchase-orders";
  }

  return "/forbidden";
}
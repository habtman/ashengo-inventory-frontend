// inventoryPermissions.js

export const inventoryPermissions = {
  admin: {
    canView: true,
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canBulkDelete: true,
    canTransfer: true,
    canAddStock: true,
    canAdjust: true,
    canSell: true,
  },

  staff: {
    canView: true,
    canCreate: false,
    canEdit: true,
    canDelete: false,
    canBulkDelete: false,
    canTransfer: true,
    canAddStock: true,
    canAdjust: true,
    canSell: true,
  },

  user: {
    canView: true,
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canBulkDelete: false,
    canTransfer: false,
    canAddStock: false,
    canAdjust: false,
    canSell: false,
  },
};
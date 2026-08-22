// purchasePermissions.js

export const purchasePermissions = {
  admin: {
    canView: true,
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canReceive: true,
  },

  staff: {
    canView: true,
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canReceive: true,
  },

  user: {
    canView: true,
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canReceive: false,
  },
};
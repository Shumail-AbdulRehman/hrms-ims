// ─────────────────────────────────────────────────────
// RBAC Configuration — Resource → Actions pattern
// ─────────────────────────────────────────────────────
// Wildcard "*" = all actions on that resource
// If a role has no key for a resource, access is denied
// ─────────────────────────────────────────────────────

const roles = {
  // ═══════════════════════ HRMS ROLES ═══════════════════════

  // DW&CE(N) — one globally, full access to everything
  super_admin: {
    unit: ["*"],
    employee: ["*"],
    attendance: ["*"],
    shift: ["*"],
    // IMS
    item: ["*"],
    vendor: ["*"],
    stock_in: ["*"],
    stock_out: ["*"],
    stock_request: ["*"],
    stock_return: ["*"],
    procurement: ["*"],
  },

  // CsMES — one per unit, final approval authority
  admin: {
    employee: ["create", "update", "view"],
    attendance: ["approve", "view"],  // approves AFTER sub_admin
    shift: ["view"],
  },

  
  sub_admin: {
    employee: ["create", "update", "view"],
    attendance: ["create", "approve", "view"],  // marks + first-level approval
    shift: ["approve", "view"],            // approves supervisor's shifts
  },

  // SDO — multiple per unit, view only
  sdo: {
    employee: ["view"],
    attendance: ["view"],
    shift: ["view"],
  },

  
  sub_engineer: {
      employee: ["view"],
    attendance: ["view"],
    shift: ["view"],
  },

  
  supervisor: {
    employee: ["view"],
    attendance: ["view"],
    shift: ["create", "update", "view"],  // assign shifts → sub_admin approves
  },

  
  employee: {
    employee: ["view_own"],
    attendance: ["view"],
    shift: ["view"],
  },

  // ═══════════════════════ IMS ROLES ═══════════════════════
  // (kept as-is until client provides IMS hierarchy)

  store_manager: {
    item: ["create", "update", "deactivate", "view"],
    vendor: ["create", "update", "deactivate", "view"],
    procurement: ["create", "view"],
    stock_in: ["view"],
    stock_out: ["view"],
  },

  inventory_operator: {
    item: ["view"],
    stock_in: ["create", "view"],
    stock_out: ["approve", "view"],
    stock_request: ["approve", "reject", "view"],
    stock_return: ["create", "view"],
  },

  ims_audit_officer: {
    item: ["view"],
    vendor: ["view"],
    stock_in: ["view"],
    stock_out: ["view"],
    stock_request: ["view"],
    stock_return: ["view"],
    procurement: ["view"],
  },
};

export default roles;

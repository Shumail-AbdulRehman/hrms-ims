

const roles = {
  super_admin: {
    hrms: ["*"],     
    ims: ["*"],      
    units: ["manage"],
    users: ["manage_all"]
  },

  admin: {
    hrms: [
      "manage_users",
      "approve_discipline",
      "approve_leave",
      "view_unit_data"
    ],
    ims: [
      "approve_procurement",
      "view_inventory",
      "transfer_stock"
    ]
  },

  hr_officer: {
    hrms: [
      "create_employee",
      "mark_attendance",
      "approve_leave",
      "create_training",
      "create_discipline",
      "view_unit_data"
    ]
  },

  supervisor: {
    hrms: [
      "view_team_data",
      "apply_leave",
      "create_discipline"
    ]
  },

  employee: {
    hrms: [
      "view_own_profile",
      "apply_leave",
      "view_training",
      "view_attendance",
      "acknowledge_discipline"
    ],
    ims: [
      "request_stock_out"
    ]
  },

  hrms_audit_officer: {
    hrms: [
      "read_only",
      "view_audit_logs"
    ]
  },

  store_manager: {
    ims: [
      "register_item",
      "create_procurement_request",
      "manage_vendors",
      "view_inventory"
    ]
  },

  inventory_operator: {
    ims: [
      "process_stock_in",
      "approve_stock_out",
      "process_stock_return",
      "view_inventory"
    ]
  },

  ims_audit_officer: {
    ims: [
      "read_only",
      "view_audit_logs"
    ]
  }
};

export default roles;

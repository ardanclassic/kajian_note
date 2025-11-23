/**
 * Role-Based Permissions Configuration
 * Defines permissions for each user role
 */

export type UserRole = "admin" | "panitia" | "ustadz" | "member";

export type Permission =
  // Users
  | "users:create"
  | "users:read_all"
  | "users:read_own"
  | "users:update_any"
  | "users:update_own"
  | "users:delete"
  | "users:change_role"
  | "users:reset_password"

  // Subscriptions
  | "subscriptions:read_all"
  | "subscriptions:read_own"
  | "subscriptions:upgrade"
  | "subscriptions:cancel"
  | "subscriptions:grant_manual"

  // Notes
  | "notes:create"
  | "notes:read_all_public"
  | "notes:read_own"
  | "notes:update_own"
  | "notes:delete_own"
  | "notes:delete_any"
  | "notes:pin"
  | "notes:create_public"
  | "notes:export_pdf"
  | "notes:export_word"

  // Settings
  | "settings:read_app"
  | "settings:update_app"
  | "settings:read_own"
  | "settings:update_own";

/**
 * Permission matrix for each role
 */
export const PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    // Users - Full access
    "users:create",
    "users:read_all",
    "users:read_own",
    "users:update_any",
    "users:update_own",
    "users:delete",
    "users:change_role",
    "users:reset_password",

    // Subscriptions - Full access
    "subscriptions:read_all",
    "subscriptions:read_own",
    "subscriptions:upgrade",
    "subscriptions:cancel",
    "subscriptions:grant_manual",

    // Notes - Full access
    "notes:create",
    "notes:read_all_public",
    "notes:read_own",
    "notes:update_own",
    "notes:delete_own",
    "notes:delete_any",
    "notes:pin",
    "notes:create_public",
    "notes:export_pdf",
    "notes:export_word",

    // Settings - Full access
    "settings:read_app",
    "settings:update_app",
    "settings:read_own",
    "settings:update_own",
  ],

  panitia: [
    // Users - View all, update own, reset password
    "users:read_all",
    "users:read_own",
    "users:update_own",
    "users:reset_password",

    // Subscriptions - Own only
    "subscriptions:read_own",
    "subscriptions:upgrade",
    "subscriptions:cancel",

    // Notes - Create, manage own, delete any, pin
    "notes:create",
    "notes:read_all_public",
    "notes:read_own",
    "notes:update_own",
    "notes:delete_own",
    "notes:delete_any",
    "notes:pin",
    "notes:create_public",
    "notes:export_pdf",

    // Settings - Own only
    "settings:read_own",
    "settings:update_own",
  ],

  ustadz: [
    // Users - View all, update own
    "users:read_all",
    "users:read_own",
    "users:update_own",

    // Subscriptions - Own only
    "subscriptions:read_own",
    "subscriptions:upgrade",
    "subscriptions:cancel",

    // Notes - Create, manage own
    "notes:create",
    "notes:read_all_public",
    "notes:read_own",
    "notes:update_own",
    "notes:delete_own",
    "notes:create_public",
    "notes:export_pdf",

    // Settings - Own only
    "settings:read_own",
    "settings:update_own",
  ],

  member: [
    // Users - Own only
    "users:read_own",
    "users:update_own",

    // Subscriptions - Own only
    "subscriptions:read_own",
    "subscriptions:upgrade",
    "subscriptions:cancel",

    // Notes - Basic access (subject to subscription limits)
    "notes:create",
    "notes:read_all_public",
    "notes:read_own",
    "notes:update_own",
    "notes:delete_own",
    // Public notes, PDF export - Premium/Advance only

    // Settings - Own only
    "settings:read_own",
    "settings:update_own",
  ],
};

/**
 * Check if user has permission
 */
export const hasPermission = (role: UserRole, permission: Permission): boolean => {
  return PERMISSIONS[role]?.includes(permission) || false;
};

/**
 * Check if user has any of the permissions
 */
export const hasAnyPermission = (role: UserRole, permissions: Permission[]): boolean => {
  return permissions.some((permission) => hasPermission(role, permission));
};

/**
 * Check if user has all permissions
 */
export const hasAllPermissions = (role: UserRole, permissions: Permission[]): boolean => {
  return permissions.every((permission) => hasPermission(role, permission));
};

/**
 * Get all permissions for a role
 */
export const getRolePermissions = (role: UserRole): Permission[] => {
  return PERMISSIONS[role] || [];
};

/**
 * Role hierarchy (for comparison)
 * Higher number = more privileges
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 4,
  panitia: 3,
  ustadz: 2,
  member: 1,
};

/**
 * Check if role1 has higher privileges than role2
 */
export const isHigherRole = (role1: UserRole, role2: UserRole): boolean => {
  return ROLE_HIERARCHY[role1] > ROLE_HIERARCHY[role2];
};

/**
 * Check if role1 has equal or higher privileges than role2
 */
export const isEqualOrHigherRole = (role1: UserRole, role2: UserRole): boolean => {
  return ROLE_HIERARCHY[role1] >= ROLE_HIERARCHY[role2];
};

/**
 * Get role display name (Indonesian)
 */
export const getRoleDisplayName = (role: UserRole): string => {
  const displayNames: Record<UserRole, string> = {
    admin: "Administrator",
    panitia: "Panitia",
    ustadz: "Ustadz",
    member: "Jamaah",
  };

  return displayNames[role] || role;
};

/**
 * Get role color for UI
 */
export const getRoleColor = (role: UserRole): string => {
  const colors: Record<UserRole, string> = {
    admin: "red",
    panitia: "blue",
    ustadz: "green",
    member: "gray",
  };

  return colors[role] || "gray";
};

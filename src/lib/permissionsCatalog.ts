import permissionCatalog from '@/data/permission-catalog.json';

export interface MenuItemDefinition {
  key: string;
  label: string;
  description?: string;
}

export interface OperationDefinition {
  key: string;
  label: string;
  description?: string;
}

export interface SpecialPermissionDefinition {
  key: string;
  label: string;
  description?: string;
  resource?: string;
}

export interface PermissionDefinition {
  key: string;
  resource: string;
  label: string;
  description: string;
}

const MENU_ITEMS = permissionCatalog.menuItems as MenuItemDefinition[];
const OPERATIONS = permissionCatalog.operations as OperationDefinition[];
const SPECIAL_PERMISSIONS = permissionCatalog.specialPermissions as SpecialPermissionDefinition[];

export type PermissionKey = string;

export const MENU_ITEM_MAP = new Map(MENU_ITEMS.map((item) => [item.key, item]));
export const OPERATION_MAP = new Map(OPERATIONS.map((item) => [item.key, item]));

export const PERMISSIONS: Record<string, PermissionKey> = (() => {
  const result: Record<string, PermissionKey> = {};

  SPECIAL_PERMISSIONS.forEach((special) => {
    const constantKey = special.key.replace(/[^A-Z0-9]+/gi, '_').toUpperCase();
    result[constantKey] = special.key;
  });

  MENU_ITEMS.forEach((menuItem) => {
    OPERATIONS.forEach((operation) => {
      const constantKey = `${menuItem.key}.${operation.key}`
        .replace(/[^A-Z0-9]+/gi, '_')
        .toUpperCase();
      result[constantKey] = `${menuItem.key}.${operation.key}`;
    });
  });

  return result;
})();

function buildPermissionDescription(menuItem: MenuItemDefinition, operation: OperationDefinition): string {
  return `${operation.label} permission for ${menuItem.label}`;
}

function buildSpecialPermissionDescription(permission: SpecialPermissionDefinition): string {
  return permission.description ?? permission.label;
}

export function getPermissionDefinitions(): PermissionDefinition[] {
  const definitions: PermissionDefinition[] = [];

  SPECIAL_PERMISSIONS.forEach((permission) => {
    definitions.push({
      key: permission.key,
      resource: permission.resource ?? 'admin',
      label: permission.label,
      description: buildSpecialPermissionDescription(permission),
    });
  });

  MENU_ITEMS.forEach((menuItem) => {
    OPERATIONS.forEach((operation) => {
      const key = `${menuItem.key}.${operation.key}`;
      definitions.push({
        key,
        resource: menuItem.key,
        label: `${menuItem.label} • ${operation.label}`,
        description: buildPermissionDescription(menuItem, operation),
      });
    });
  });

  return definitions;
}

export const ALL_PERMISSION_KEYS: PermissionKey[] = getPermissionDefinitions().map((permission) => permission.key);

export function isPermissionKey(value: string): value is PermissionKey {
  return ALL_PERMISSION_KEYS.includes(value) || SPECIAL_PERMISSIONS.some((permission) => permission.key === value);
}

export function getMenuItems(): MenuItemDefinition[] {
  return [...MENU_ITEMS];
}

export function getOperations(): OperationDefinition[] {
  return [...OPERATIONS];
}

export function getSpecialPermissions(): SpecialPermissionDefinition[] {
  return [...SPECIAL_PERMISSIONS];
}


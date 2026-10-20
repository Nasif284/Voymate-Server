export enum AdminRoleType {
  SUPER_ADMIN = 'SUPER_ADMIN',
  MODERATOR = 'MODERATOR',
  ANALYST = 'ANALYST',
}

export function normalizeAdminRole(role?: string | null): AdminRoleType | null {
  if (!role) return null;
  console.log('before:', role);
  const cleaned = role
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');
  console.log('after:', cleaned);
  if (
    cleaned === 'SUPER_ADMIN' ||
    cleaned === 'SUPER ADMIN' ||
    cleaned === 'ADMIN'
  ) {
    return AdminRoleType.SUPER_ADMIN;
  }
  if (cleaned === 'MODERATOR') {
    return AdminRoleType.MODERATOR;
  }
  if (cleaned === 'ANALYST') {
    return AdminRoleType.ANALYST;
  }
  return null;
}

export function formatAdminRoleDisplayName(role?: string | null): string {
  const normalized = normalizeAdminRole(role);
  switch (normalized) {
    case AdminRoleType.SUPER_ADMIN:
      return 'Super Admin';
    case AdminRoleType.MODERATOR:
      return 'Moderator';
    case AdminRoleType.ANALYST:
      return 'Analyst';
    default:
      return role || 'Admin';
  }
}

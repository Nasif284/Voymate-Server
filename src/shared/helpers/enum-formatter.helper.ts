export function formatEnumToDisplayName(val?: string | null): string {
  if (!val) return '';

  const customMap: Record<string, string> = {
    // Onboarding source
    FRIENDS_FAMILY: 'Friends or Family',
    SOCIAL_MEDIA: 'Social Media',
    SEARCH_ENGINE: 'Search Engine',
    TRAVEL_BLOG: 'Travel Blog',
    APP_STORE: 'App Store',
    OTHER: 'Other',

    // Account status
    ACTIVE: 'Active',
    SUSPENDED: 'Suspended',
    BANNED: 'Banned',
    DEACTIVATED: 'Deactivated',

    // Gender
    MALE: 'Male',
    FEMALE: 'Female',
    NON_BINARY: 'Non-Binary',
  };

  const upper = val.toUpperCase();
  if (customMap[upper]) {
    return customMap[upper];
  }

  // Fallback: convert CONSTANT_CASE or snake_case to Title Case
  return val
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function formatAccountStatusDisplayName(status?: string | null): string {
  if (!status) return 'Active';
  const upper = status.toUpperCase();
  if (upper === 'ACTIVE') return 'Active';
  if (upper === 'SUSPENDED') return 'Suspended';
  if (upper === 'BANNED') return 'Banned';
  if (upper === 'DEACTIVATED') return 'Deactivated';
  return formatEnumToDisplayName(status);
}

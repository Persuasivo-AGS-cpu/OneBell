const THEMES = new Set(['dark', 'light', 'system']);

export function getThemePreference(profile = {}) {
  return THEMES.has(profile.theme) ? profile.theme : 'system';
}

export function resolveTheme(preference = 'system', systemPrefersDark = true) {
  if (preference === 'light' || preference === 'dark') return preference;
  return systemPrefersDark ? 'dark' : 'light';
}

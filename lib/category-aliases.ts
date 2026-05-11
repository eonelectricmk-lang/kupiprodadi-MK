export const CATEGORY_SLUG_ALIASES: Record<string, string> = {
  nedvoznosti: 'nedviznosti',
  'hrana-gotvenj': 'hrana-gotvenje',
  'dom-i-gradina': 'dom-gradina',
  moda: 'moda-obleka',
  sport: 'sportska-oprema',
  biznis: 'biznis-masini',
};

export function normalizeCategorySlug(slug?: string | null) {
  if (!slug) return '';
  return CATEGORY_SLUG_ALIASES[slug] || slug;
}

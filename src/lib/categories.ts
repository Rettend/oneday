export interface CategoryStyle {
  color: string
  icon: string
  label: string
}

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  study: { color: '#3b82f6', icon: 'i-ph-book-open-duotone', label: 'Study' },
  project: { color: '#8b5cf6', icon: 'i-ph-code-duotone', label: 'Project' },
  freelance: { color: '#f59e0b', icon: 'i-ph-briefcase-duotone', label: 'Freelance' },
  entertainment: { color: '#f43f5e', icon: 'i-ph-game-controller-duotone', label: 'Entertainment' },
  other: { color: '#64748b', icon: 'i-ph-dots-three-outline-duotone', label: 'Other' },
  uncategorized: { color: '#4b5563', icon: 'i-ph-question-duotone', label: 'Uncategorized' },
}

const DEFAULT_STYLE: CategoryStyle = {
  color: '#6b7280',
  icon: 'i-ph-tag-duotone',
  label: 'Unknown',
}

export function getCategoryStyle(category: string | null | undefined): CategoryStyle {
  const key = (category ?? 'uncategorized').trim().toLowerCase()
  return CATEGORY_STYLES[key] ?? { ...DEFAULT_STYLE, label: category ?? 'Unknown' }
}

export function getCategoryColor(category: string | null | undefined): string {
  return getCategoryStyle(category).color
}

export function getCategoryIcon(category: string | null | undefined): string {
  return getCategoryStyle(category).icon
}

export const CATEGORY_DISPLAY_ORDER = ['study', 'project', 'freelance', 'entertainment', 'other', 'uncategorized'] as const

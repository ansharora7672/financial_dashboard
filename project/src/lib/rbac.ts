import { Tab } from '@/types'

// function to check if a user is allowed to access a given tab
export function canAccess(allowedTabs: Tab[], tab: Tab): boolean {
  return allowedTabs.includes(tab)
}
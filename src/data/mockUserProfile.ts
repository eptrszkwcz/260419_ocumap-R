import type { SubscriptionPlanId } from '@/data/mockAccountData'

export type MockUserProfile = {
  displayName: string
  email: string
  photoUrl: string
  teamName: string
  planId: SubscriptionPlanId
}

export const MOCK_DEFAULT_USER: MockUserProfile = {
  displayName: 'Jordy Smith',
  email: 'shredder@smith.co',
  photoUrl: '/avatars/jordy-smith.png',
  teamName: 'Smith Property Group',
  planId: 'professional',
}

export const MOCK_TAJ_USER: MockUserProfile = {
  displayName: 'Taj Burrows',
  email: 'taj@burrows.co',
  photoUrl: '/avatars/taj-burrows.png',
  teamName: 'Burrows',
  planId: 'free-trial',
}

export function isTajLogin(displayName: string, password: string): boolean {
  return displayName.trim().toLowerCase() === 'taj' && password.trim().toLowerCase() === 'taj'
}

export function isFreePlan(user: { planId?: string } | null | undefined): boolean {
  return user?.planId === 'free-trial'
}

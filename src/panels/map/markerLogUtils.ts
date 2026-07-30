import type { ReactNode } from 'react'
import { createElement, Fragment } from 'react'

import type { AuthUser } from '@/context/AuthContext'
import type { MarkerLogEntry } from '@/data/sampleAssets'

export function newMarkerLogEntryId(): string {
  return `log-${crypto.randomUUID()}`
}

export function createUserLogEntry(body: string, author: AuthUser): MarkerLogEntry {
  const now = new Date().toISOString()
  return {
    id: newMarkerLogEntryId(),
    body: body.trim(),
    authorDisplayName: author.displayName,
    authorEmail: author.email,
    createdAt: now,
    kind: 'user',
  }
}

export function createSystemLogEntry(body: string, authorDisplayName = 'System'): MarkerLogEntry {
  const now = new Date().toISOString()
  return {
    id: newMarkerLogEntryId(),
    body,
    authorDisplayName,
    createdAt: now,
    kind: 'system',
  }
}

/** e.g. "Jan 5, 2026 · 2:34 PM" */
export function formatMarkerLogTimestamp(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const datePart = d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const timePart = d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
  return `${datePart} · ${timePart}`
}

const MENTION_PATTERN = /(@[\w.-]+)/g

/** Split body text and highlight @mentions for display. */
export function renderMarkerLogBody(body: string): ReactNode {
  const parts = body.split(MENTION_PATTERN)
  if (parts.length === 1) return body

  return parts.map((part, index) => {
    if (part.startsWith('@')) {
      return createElement(
        'span',
        { key: index, className: 'text-fg-highlight font-medium' },
        part,
      )
    }
    return createElement(Fragment, { key: index }, part)
  })
}

export function canEditMarkerLogEntry(
  entry: MarkerLogEntry,
  currentUserDisplayName: string | undefined,
): boolean {
  return (
    entry.kind === 'user' &&
    currentUserDisplayName != null &&
    entry.authorDisplayName === currentUserDisplayName
  )
}

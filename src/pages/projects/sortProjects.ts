import type { SortDirection } from '@/components/SortableColumnHeader'
import { parseToIsoDate } from '@/lib/formatDisplayDateFromIsoDate'
import type { ProjectRecord } from '@/data/sampleProjects'
import type { ProjectListColumnId } from '@/pages/projects/projectListColumns'

export type ProjectListSortColumn = 'name' | ProjectListColumnId

function compareValues(a: string | number, b: string | number): number {
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b
  }
  return String(a).localeCompare(String(b), undefined, { sensitivity: 'base' })
}

function sortValueForColumn(project: ProjectRecord, column: ProjectListSortColumn): string | number {
  switch (column) {
    case 'name':
      return project.name
    case 'lastModified':
      return parseToIsoDate(project.lastModified)
    case 'files':
      return project.featureFileCount
    case 'size':
      return project.projectSizeMb
    case 'status':
      return project.status
  }
}

export function sortProjects(
  projects: ProjectRecord[],
  column: ProjectListSortColumn,
  direction: SortDirection,
): ProjectRecord[] {
  const sorted = [...projects]
  sorted.sort((a, b) => {
    const cmp = compareValues(sortValueForColumn(a, column), sortValueForColumn(b, column))
    return direction === 'asc' ? cmp : -cmp
  })
  return sorted
}

import { useNewProject } from '@/context/NewProjectContext'
import type { ProjectType } from '@/data/sampleProjects'

type OrganizationOption = {
  type: ProjectType
  title: string
  description: string
  icon: string
}

const options: OrganizationOption[] = [
  {
    type: 'Infrastructure',
    title: 'Map / Site',
    description:
      'Best for roads, rail, outdoor sites, GPS media, KML/KMZ, GPX, or CSV files.',
    icon: '🗺️',
  },
  {
    type: 'Building',
    title: 'Floor Plan / Drawing',
    description:
      'Best for buildings, interiors, PDF drawings, rooms, floors, and floor-based documentation.',
    icon: '📐',
  },
  {
    type: 'FilesOnly',
    title: 'Files Only',
    description:
      'Best if you only have photos, videos, documents, or 360s and want to place them later.',
    icon: '📁',
  },
]

const heroTitleClass = 'font-title text-title font-bold text-fg'

export function NewProjectOrganizationPicker() {
  const { draft, setOrganizationType } = useNewProject()

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto p-panel-padding">
      <div
        id="new-project-type-container"
        className="mx-auto my-auto flex h-[480px] w-full max-w-xl shrink-0 flex-col gap-6 overflow-auto"
      >
        <div>
          <h2 className={heroTitleClass}>How do you want to organize this project?</h2>
          <p className="mt-2 font-sans text-standard text-fg-muted">
            Choose a starting workspace. You can add map, floor plan, or file organization later.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {options.map((option) => {
            const selected = draft.organizationType === option.type
            return (
              <button
                key={option.type}
                type="button"
                onClick={() => setOrganizationType(option.type)}
                className={
                  'flex w-full items-start gap-4 rounded-panel border px-4 py-4 text-left transition-colors focus-visible:ring-2 focus-visible:ring-fg-highlight/35 focus-visible:outline-none ' +
                  (selected
                    ? 'border-fg-highlight bg-area-highlight'
                    : 'border-stroke bg-panel hover:border-fg-highlight/50 hover:bg-area-highlight/50')
                }
                aria-pressed={selected}
              >
                <span className="text-2xl leading-none" aria-hidden>
                  {option.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-title text-standard font-bold text-fg">
                    {option.title}
                  </span>
                  <span className="mt-1 block font-sans text-standard leading-relaxed text-fg-muted">
                    {option.description}
                  </span>
                </span>
              </button>
            )
          })}
        </div>

        <div className="rounded-panel border-l-4 border-fg-highlight bg-fg-highlight/8 px-4 py-3">
          <p className="font-sans text-standard leading-relaxed text-fg">
            This choice sets the starting workspace only. The project can still add map, floor plan,
            media, or files-only organization later.
          </p>
        </div>
      </div>
    </div>
  )
}

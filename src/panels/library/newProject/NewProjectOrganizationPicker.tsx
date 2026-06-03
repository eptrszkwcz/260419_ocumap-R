import { useNewProject } from '@/context/NewProjectContext'
import type { ProjectType } from '@/data/sampleProjects'

type OrganizationShape = 'circle' | 'triangle' | 'square'

type OrganizationOption = {
  type: ProjectType
  title: string
  description: string
  shape: OrganizationShape
}

const options: OrganizationOption[] = [
  {
    type: 'Infrastructure',
    title: 'Map / Site',
    description:
      'Best for roads, rail, outdoor sites, GPS media, KML/KMZ, GPX, or CSV files.',
    shape: 'circle',
  },
  {
    type: 'Building',
    title: 'Floor Plan / Drawing',
    description:
      'Best for buildings, interiors, PDF drawings, rooms, floors, and floor-based documentation.',
    shape: 'triangle',
  },
  {
    type: 'FilesOnly',
    title: 'Files Only',
    description:
      'Best if you only have photos, videos, documents, or 360s and want to place them later.',
    shape: 'square',
  },
]

function OrganizationShapeIcon({ shape }: { shape: OrganizationShape }) {
  const strokeProps = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinejoin: 'round' as const,
  }

  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 24 24"
      className="shrink-0 text-fg-muted"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {shape === 'circle' && <circle cx="12" cy="12" r="8.5" {...strokeProps} />}
      {shape === 'triangle' && (
        <polygon points="5,19 5,5 19,19" {...strokeProps} />
      )}
      {shape === 'square' && <rect x="5" y="5" width="14" height="14" {...strokeProps} />}
    </svg>
  )
}

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
                <span className="flex shrink-0 self-stretch items-center" aria-hidden>
                  <OrganizationShapeIcon shape={option.shape} />
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

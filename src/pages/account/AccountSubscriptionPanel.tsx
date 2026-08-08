import { CheckIcon } from '@heroicons/react/24/outline'

import { MOCK_CURRENT_PLAN_ID, type SubscriptionPlanId } from '@/data/mockAccountData'
import {
  accountPrimaryButtonClass,
  accountSectionClass,
  accountSectionDescClass,
  accountSectionTitleClass,
} from '@/pages/account/accountStyles'

type PlanColumn = {
  id: SubscriptionPlanId
  label: string
}

const PLANS: PlanColumn[] = [
  { id: 'free-trial', label: 'Free Trial' },
  { id: 'professional', label: 'Professional' },
  { id: 'ocumap-360', label: 'OcuMap 360' },
  { id: 'enterprise', label: 'Enterprise' },
]

type CellValue = string | 'check' | 'dash' | { primary: string; subline: string }

type FeatureRow = {
  label: string
  values: Record<SubscriptionPlanId, CellValue>
}

const FEATURE_ROWS: FeatureRow[] = [
  {
    label: 'Price',
    values: {
      'free-trial': 'Free for 30 days',
      professional: '$99/mo ($990/yr)',
      'ocumap-360': '$249/mo ($2,490/yr)',
      enterprise: 'Custom',
    },
  },
  {
    label: 'Storage',
    values: {
      'free-trial': '10 GB',
      professional: '100 GB',
      'ocumap-360': '500 GB',
      enterprise: 'Custom',
    },
  },
  {
    label: 'Team members',
    values: {
      'free-trial': '1',
      professional: { primary: '1', subline: '+ 3 seats at $29/seat/mo.' },
      'ocumap-360': '10',
      enterprise: 'Custom',
    },
  },
  {
    label: 'Projects & assets',
    values: {
      'free-trial': 'Unlimited',
      professional: 'Unlimited',
      'ocumap-360': 'Unlimited',
      enterprise: 'Unlimited',
    },
  },
  {
    label: 'Published Viewers',
    values: {
      'free-trial': 'Unlimited*',
      professional: 'Unlimited*',
      'ocumap-360': 'Unlimited*',
      enterprise: 'Unlimited* + white label',
    },
  },
  {
    label: 'Original files preserved',
    values: {
      'free-trial': 'check',
      professional: 'check',
      'ocumap-360': 'check',
      enterprise: 'check',
    },
  },
  {
    label: 'Native point cloud viewer',
    values: {
      'free-trial': 'check',
      professional: 'check',
      'ocumap-360': 'check',
      enterprise: 'check',
    },
  },
  {
    label: 'Measurement tools',
    values: {
      'free-trial': 'check',
      professional: 'check',
      'ocumap-360': 'check',
      enterprise: 'check',
    },
  },
  {
    label: 'Password-protected sharing',
    values: {
      'free-trial': 'check',
      professional: 'check',
      'ocumap-360': 'check',
      enterprise: 'check',
    },
  },
  {
    label: 'Historical documentation',
    values: {
      'free-trial': 'check',
      professional: 'check',
      'ocumap-360': 'check',
      enterprise: 'check',
    },
  },
  {
    label: 'Logbook & activity history',
    values: {
      'free-trial': 'check',
      professional: 'check',
      'ocumap-360': 'check',
      enterprise: 'check',
    },
  },
  {
    label: 'Priority support',
    values: {
      'free-trial': 'dash',
      professional: 'dash',
      'ocumap-360': 'check',
      enterprise: 'check',
    },
  },
]

const CURRENT_PLAN_BG = 'bg-area-highlight/40'

function currentPlanCellClass(isTop: boolean, isBottom: boolean): string {
  let className = `${CURRENT_PLAN_BG} border-fg-highlight`
  if (isTop) className += ' overflow-hidden rounded-t-panel border-x-2 border-t-2'
  else if (isBottom) className += ' overflow-hidden rounded-b-panel border-x-2 border-b-2'
  else className += ' border-x-2'
  return className
}

function planCellClass(isCurrent: boolean, isTop: boolean, isBottom: boolean): string {
  if (!isCurrent) return 'bg-panel text-fg'
  return `${currentPlanCellClass(isTop, isBottom)} text-fg-highlight [&_svg]:text-fg-highlight`
}

function CellContent({ value }: { value: CellValue }) {
  if (value === 'check') {
    return <CheckIcon className="mx-auto size-5 text-current" aria-label="Included" />
  }
  if (value === 'dash') {
    return <span className="text-fg-muted">—</span>
  }
  if (typeof value === 'object') {
    return (
      <div className="flex flex-col gap-0.5">
        <span>{value.primary}</span>
        <span className="text-[11px] leading-tight text-fg-muted">{value.subline}</span>
      </div>
    )
  }
  return <span>{value}</span>
}

export function AccountSubscriptionPanel() {
  return (
    <div className="flex w-full flex-col gap-6 pb-2">
      <section className={accountSectionClass} aria-labelledby="subscription-plans">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="subscription-plans" className={accountSectionTitleClass}>
              Plans
            </h2>
            <p className={`mt-1 ${accountSectionDescClass}`}>
              Compare OcuMap plans.
            </p>
          </div>
          <button type="button" className={`${accountPrimaryButtonClass} shrink-0`}>
            Update Subscription
          </button>
        </div>

        <div className="overflow-x-auto rounded-panel border border-stroke">
          <table className="w-full min-w-[720px] border-separate border-spacing-0 font-sans text-standard">
            <thead>
              <tr className="border-b border-stroke">
                <th className="bg-panel px-3 py-3 text-left font-bold text-fg" scope="col">
                  <span className="sr-only">Feature</span>
                </th>
                {PLANS.map((plan) => {
                  const current = plan.id === MOCK_CURRENT_PLAN_ID
                  return (
                    <th
                      key={plan.id}
                      scope="col"
                      className={`px-3 py-3 text-center font-bold ${planCellClass(current, true, false)}`}
                    >
                      <span className="block">{plan.label}</span>
                      {current ? (
                        <span className="mt-1 block text-badge font-bold text-fg-highlight">
                          Current plan
                        </span>
                      ) : null}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {FEATURE_ROWS.map((row, rowIndex) => (
                <tr key={row.label} className="border-b border-stroke/70 last:border-b-0">
                  <th
                    scope="row"
                    className="bg-panel px-3 py-2.5 text-left font-normal text-fg"
                  >
                    {row.label}
                  </th>
                  {PLANS.map((plan) => {
                    const current = plan.id === MOCK_CURRENT_PLAN_ID
                    const isLastRow = rowIndex === FEATURE_ROWS.length - 1
                    return (
                      <td
                        key={plan.id}
                        className={`px-3 py-2.5 text-center ${planCellClass(current, false, isLastRow)}`}
                      >
                        <CellContent value={row.values[plan.id]} />
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-2 font-sans text-badge text-fg-muted">
          <p>* Unlimited under our Fair Use Policy.</p>
          <p>
            OcuMap natively displays photos, standard video, 360° imagery, and LAS, LAZ, and E57
            point clouds. Supported DWG, RVT, IFC, glTF, and FBX files can be stored and viewed
            through Autodesk-powered viewing. PDFs, maps, GPS data, KML, KMZ, GPX, CSV, and related
            project documents can be stored and organized with the asset record.
          </p>
        </div>
      </section>
    </div>
  )
}

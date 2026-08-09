import { CheckIcon } from '@heroicons/react/24/outline'

import { TEAM_ROLE_COLUMNS, TEAM_ROLE_PERMISSION_ROWS } from '@/data/mockTeamData'
import {
  accountSectionClass,
  accountSectionDescClass,
  accountSectionTitleClass,
} from '@/pages/account/accountStyles'
import type { TeamPermissionCell } from '@/pages/team/types'

function CellContent({ value }: { value: TeamPermissionCell }) {
  if (value === 'check') {
    return <CheckIcon className="mx-auto size-5 text-fg-highlight" aria-label="Allowed" />
  }
  return <span className="text-fg-muted">—</span>
}

export function TeamRolesPanel() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 pb-2">
      <section className={accountSectionClass} aria-labelledby="team-roles">
        <div>
          <h2 id="team-roles" className={accountSectionTitleClass}>
            Roles
          </h2>
          <p className={`mt-1 ${accountSectionDescClass}`}>
            Compare what Admin, Editor, and Viewer can do on this team.
          </p>
        </div>

        <div className="overflow-x-auto rounded-panel border border-stroke">
          <table className="w-full min-w-[520px] border-collapse font-sans text-standard">
            <thead>
              <tr className="border-b border-stroke bg-area-highlight/40">
                <th className="px-4 py-2.5 text-left font-bold text-fg" scope="col">
                  Permission
                </th>
                {TEAM_ROLE_COLUMNS.map((role) => (
                  <th
                    key={role.id}
                    scope="col"
                    className="px-4 py-2.5 text-center font-bold text-fg"
                  >
                    {role.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TEAM_ROLE_PERMISSION_ROWS.map((row) => (
                <tr key={row.label} className="border-b border-stroke/60 last:border-b-0 bg-panel">
                  <th
                    scope="row"
                    className="px-4 py-2.5 text-left font-normal text-fg"
                  >
                    {row.label}
                  </th>
                  {TEAM_ROLE_COLUMNS.map((role) => (
                    <td key={role.id} className="px-4 py-2.5 text-center">
                      <CellContent value={row.values[role.id]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

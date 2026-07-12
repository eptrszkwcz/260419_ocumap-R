import { CheckIcon } from '@heroicons/react/16/solid'

type RadioOptionProps = {
  checked: boolean
  onChange: () => void
  label: string
  name: string
  id?: string
  disabled?: boolean
  compact?: boolean
}

const boxBaseClass =
  'flex size-3.5 shrink-0 items-center justify-center rounded border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-fg-highlight/35 peer-focus-visible:outline-none'

export function RadioOption({
  checked,
  onChange,
  label,
  name,
  id,
  disabled = false,
  compact = false,
}: RadioOptionProps) {
  return (
    <label
      htmlFor={id}
      className={
        'flex cursor-pointer items-center gap-2.5 rounded-panel text-left font-sans text-standard leading-none ' +
        (compact ? 'px-0 py-0' : 'px-[16px] py-[10px] ') +
        (disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-area-highlight')
      }
    >
      <input
        id={id}
        type="radio"
        name={name}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className={
          checked
            ? boxBaseClass + ' border-fg-highlight bg-fg-highlight'
            : boxBaseClass + ' border-stroke bg-panel'
        }
      >
        {checked ? <CheckIcon className="size-2.5 text-white" strokeWidth={2.5} /> : null}
      </span>
      <span className="text-fg min-w-0">{label}</span>
    </label>
  )
}

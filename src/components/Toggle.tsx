import ui from '../styles/ui.module.css'

type Props = { on: boolean; onLabel: string; offLabel: string; onToggle: () => void }

export default function Toggle({ on, onLabel, offLabel, onToggle }: Props) {
  return (
    <button type="button" className={ui.toggleRow} onClick={onToggle} aria-pressed={on}>
      {on ? onLabel : offLabel}
      <span className={on ? `${ui.switch} ${ui.switchOn}` : ui.switch}>
        <span className={ui.knob} />
      </span>
    </button>
  )
}

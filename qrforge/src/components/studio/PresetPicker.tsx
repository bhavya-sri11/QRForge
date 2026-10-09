import { PRESETS, type Preset } from '../../lib/qr/presets'
import { ModuleStyleIcon } from './icons'
import styles from './PresetPicker.module.css'

interface PresetPickerProps {
  activeId: string | null
  onSelect: (preset: Preset) => void
}

export function PresetPicker({ activeId, onSelect }: PresetPickerProps) {
  return (
    <div className={styles.grid} role="group" aria-label="Presets">
      {PRESETS.map((preset) => {
        const active = preset.id === activeId
        return (
          <button
            key={preset.id}
            type="button"
            className={styles.tile}
            aria-pressed={active}
            onClick={() => onSelect(preset)}
          >
            <span className={styles.swatch} style={{ background: preset.style.background }} aria-hidden="true">
              <ModuleStyleIcon style={preset.style.dotStyle} color={preset.style.foreground} size={26} />
            </span>
            <span className={styles.name}>{preset.name}</span>
          </button>
        )
      })}
    </div>
  )
}

import { ArrowLeftRight } from 'lucide-react'
import { ERROR_CORRECTION_INFO } from '../../lib/qr/capacity'
import { findMatchingPreset, type Preset } from '../../lib/qr/presets'
import {
  DOT_STYLES,
  ERROR_CORRECTION_LEVELS,
  EYE_CENTER_STYLES,
  EYE_FRAME_STYLES,
  LOGO_PADDING_RANGE,
  LOGO_SCALE_RANGE,
  MARGIN_RANGE,
  SIZE_RANGE,
  type QrStyle,
} from '../../lib/qr/types'
import { Button } from '../ui/Button'
import { ChoiceGroup } from '../ui/ChoiceGroup'
import { ColorField } from '../ui/ColorField'
import { Group, Panel } from '../ui/Panel'
import { Slider } from '../ui/Slider'
import { Switch } from '../ui/Switch'
import { EyeCenterIcon, EyeFrameIcon, ModuleStyleIcon } from './icons'
import { DOT_STYLE_LABELS, EYE_CENTER_LABELS, EYE_FRAME_LABELS } from './labels'
import { LogoField } from './LogoField'
import { PresetPicker } from './PresetPicker'
import styles from './StylePanel.module.css'

interface StylePanelProps {
  style: QrStyle
  onChange: (patch: Partial<QrStyle>) => void
  onApplyPreset: (preset: Preset) => void
  onSwapColors: () => void
}

/** Share of the code's width the logo will actually occupy at this level. */
const RECOVERY_FRACTION = { L: 0.07, M: 0.15, Q: 0.25, H: 0.3 } as const

const DOT_OPTIONS = DOT_STYLES.map((value) => ({
  value,
  label: DOT_STYLE_LABELS[value],
  icon: <ModuleStyleIcon style={value} />,
}))

const EYE_FRAME_OPTIONS = EYE_FRAME_STYLES.map((value) => ({
  value,
  label: EYE_FRAME_LABELS[value],
  icon: <EyeFrameIcon style={value} />,
}))

const EYE_CENTER_OPTIONS = EYE_CENTER_STYLES.map((value) => ({
  value,
  label: EYE_CENTER_LABELS[value],
  icon: <EyeCenterIcon style={value} />,
}))

const ECL_OPTIONS = ERROR_CORRECTION_LEVELS.map((value) => ({
  value,
  label: value,
  description: ERROR_CORRECTION_INFO[value].recovery,
  ariaLabel: `${value} – ${ERROR_CORRECTION_INFO[value].label}, recovers ${ERROR_CORRECTION_INFO[value].recovery}`,
}))

export function StylePanel({ style, onChange, onApplyPreset, onSwapColors }: StylePanelProps) {
  const activePreset = findMatchingPreset(style)
  const logoWidthPercent = Math.round(Math.sqrt(style.logoScale * RECOVERY_FRACTION[style.errorCorrection]) * 100)

  return (
    <Panel id="design" title="Design" description="Colours, shapes and export settings">
      <Group
        title="Presets"
        aside={<span className={styles.groupMeta}>{activePreset ? activePreset.name : 'Custom'}</span>}
      >
        <PresetPicker activeId={activePreset?.id ?? null} onSelect={onApplyPreset} />
      </Group>

      <Group
        title="Colours"
        aside={
          <Button size="sm" variant="ghost" icon={<ArrowLeftRight />} onClick={onSwapColors}>
            Swap
          </Button>
        }
      >
        <div className={styles.columns}>
          <ColorField
            id="foreground"
            label="Code"
            value={style.foreground}
            onChange={(foreground) => onChange({ foreground })}
          />
          <ColorField
            id="background"
            label="Background"
            value={style.background}
            onChange={(background) => onChange({ background })}
          />
        </div>
      </Group>

      <Group title="Shape">
        <ChoiceGroup
          name="dot-style"
          legend="Modules"
          appearance="tiles"
          columns={3}
          value={style.dotStyle}
          options={DOT_OPTIONS}
          onChange={(dotStyle) => onChange({ dotStyle })}
        />
        <ChoiceGroup
          name="eye-frame"
          legend="Eye frame"
          value={style.eyeFrame}
          options={EYE_FRAME_OPTIONS}
          columns={3}
          onChange={(eyeFrame) => onChange({ eyeFrame })}
        />
        <ChoiceGroup
          name="eye-center"
          legend="Eye centre"
          value={style.eyeCenter}
          options={EYE_CENTER_OPTIONS}
          columns={3}
          onChange={(eyeCenter) => onChange({ eyeCenter })}
        />
      </Group>

      <Group title="Output">
        <Slider
          id="size"
          label="Export size"
          value={style.size}
          min={SIZE_RANGE.min}
          max={SIZE_RANGE.max}
          step={SIZE_RANGE.step}
          formatValue={(value) => `${value} px`}
          onChange={(size) => onChange({ size })}
        />
        <Slider
          id="margin"
          label="Margin"
          value={style.margin}
          min={MARGIN_RANGE.min}
          max={MARGIN_RANGE.max}
          step={MARGIN_RANGE.step}
          formatValue={(value) => `${value} px`}
          hint="The quiet zone around the code. Scanners rely on it."
          onChange={(margin) => onChange({ margin })}
        />
        <ChoiceGroup
          name="error-correction"
          legend="Error correction"
          value={style.errorCorrection}
          options={ECL_OPTIONS}
          columns={4}
          hint="Higher levels survive smudges and make room for a logo, but add more modules."
          onChange={(errorCorrection) => onChange({ errorCorrection })}
        />
      </Group>

      <Group title="Logo">
        <LogoField logo={style.logo} onChange={(logo) => onChange({ logo })} />
        {style.logo && (
          <>
            <Slider
              id="logo-scale"
              label="Logo size"
              value={style.logoScale}
              min={LOGO_SCALE_RANGE.min}
              max={LOGO_SCALE_RANGE.max}
              step={LOGO_SCALE_RANGE.step}
              formatValue={() => `${logoWidthPercent}% of width`}
              hint="Capped by the error-correction level so the code stays readable."
              onChange={(logoScale) => onChange({ logoScale })}
            />
            <Slider
              id="logo-padding"
              label="Padding"
              value={style.logoPadding}
              min={LOGO_PADDING_RANGE.min}
              max={LOGO_PADDING_RANGE.max}
              step={LOGO_PADDING_RANGE.step}
              formatValue={(value) => `${value} px`}
              onChange={(logoPadding) => onChange({ logoPadding })}
            />
            <Switch
              id="hide-dots"
              label="Clear space behind logo"
              description="Removes modules under the logo for a cleaner look."
              checked={style.hideDotsBehindLogo}
              onChange={(hideDotsBehindLogo) => onChange({ hideDotsBehindLogo })}
            />
          </>
        )}
      </Group>
    </Panel>
  )
}

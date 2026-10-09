import { RotateCcw, ShieldCheck } from 'lucide-react'
import { Button } from '../ui/Button'
import { BrandMark } from './icons'
import styles from './TopBar.module.css'

interface TopBarProps {
  onReset: () => void
}

export function TopBar({ onReset }: TopBarProps) {
  return (
    <header className={styles.bar}>
      <div className={styles.brand}>
        <BrandMark />
        <h1 className={styles.wordmark}>
          QRForge
          <span className={styles.product}>Studio</span>
        </h1>
      </div>
      <div className={styles.actions}>
        <span className={styles.privacy}>
          <ShieldCheck size={15} aria-hidden="true" />
          Runs in your browser — nothing is uploaded
        </span>
        <Button
          variant="ghost"
          size="sm"
          icon={<RotateCcw />}
          onClick={onReset}
          className={styles.reset}
          aria-label="Reset to defaults"
        >
          <span className={styles.resetLabel}>Reset</span>
        </Button>
      </div>
    </header>
  )
}

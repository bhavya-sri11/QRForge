import { useEffect, useRef, useState } from 'react'

/**
 * Tracks whether the main preview stage is on screen, so a compact sticky
 * preview can take over once it scrolls away. Observation only runs while
 * `enabled` is true (small screens), so desktop pays nothing.
 */
export function useStageVisibility(enabled: boolean) {
  const stageRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const stage = stageRef.current
    if (!stage || !enabled) return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.1 })
    observer.observe(stage)
    return () => observer.disconnect()
  }, [enabled])

  return { stageRef, stageHidden: enabled && !visible }
}

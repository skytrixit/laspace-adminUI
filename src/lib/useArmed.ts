import { useEffect, useState } from 'react'

/** Two-step destructive action: the first click arms, the second commits; arming lapses after 3 s. */
export function useArmed() {
  const [armedId, setArmedId] = useState<number | null>(null)
  useEffect(() => {
    if (armedId === null) return
    const t = window.setTimeout(() => setArmedId(null), 3000)
    return () => window.clearTimeout(t)
  }, [armedId])
  const confirm = (id: number, commit: () => void) => {
    if (armedId === id) {
      setArmedId(null)
      commit()
    } else {
      setArmedId(id)
    }
  }
  return { armedId, confirm }
}

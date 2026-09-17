import { useEffect, useState } from 'react'

/** Drives every live timer in the app off real wall-clock time. */
export function useLiveClock(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  return now
}

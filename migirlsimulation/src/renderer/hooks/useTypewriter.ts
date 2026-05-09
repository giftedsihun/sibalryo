import { useState, useEffect, useRef, useCallback } from 'react'

export function useTypewriter(text: string, speed = 35, enabled = true) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const indexRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const complete = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    setDisplayed(text)
    setDone(true)
  }, [text])

  useEffect(() => {
    if (!enabled) { setDisplayed(text); setDone(true); return }
    setDisplayed('')
    setDone(false)
    indexRef.current = 0
    if (timerRef.current) clearInterval(timerRef.current)

    if (!text) { setDone(true); return }

    timerRef.current = setInterval(() => {
      indexRef.current += 1
      setDisplayed(text.slice(0, indexRef.current))
      if (indexRef.current >= text.length) {
        clearInterval(timerRef.current!)
        setDone(true)
      }
    }, speed)

    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [text, speed, enabled])

  return { displayed, done, complete }
}

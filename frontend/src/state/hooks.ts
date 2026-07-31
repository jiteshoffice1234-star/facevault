import { useEffect } from 'react'

export function useDebounced<T>(value: T, delay: number, cb: (v: T) => void) {
  useEffect(() => {
    const timer = setTimeout(() => cb(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay, cb])
}

export function useIdle(cb: () => void, delay = 800) {
  useEffect(() => {
    const id = window.setTimeout(() => {
      cb()
    }, delay)
    return () => window.clearTimeout(id)
  }, [cb, delay])
}

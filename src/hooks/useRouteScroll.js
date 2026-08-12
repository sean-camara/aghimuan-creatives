import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function useRouteScroll() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'instant' })
      return undefined
    }
    const timer = window.setTimeout(
      () => document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' }),
      40,
    )
    return () => window.clearTimeout(timer)
  }, [pathname, hash])
}

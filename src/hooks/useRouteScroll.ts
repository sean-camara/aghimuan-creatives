import { useEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

export function useRouteScroll() {
  const { pathname, hash } = useLocation()
  const navigationType = useNavigationType()
  const previousLocationKey = useRef<string | null>(null)

  useEffect(() => {
    const previousRestoration = window.history.scrollRestoration
    window.history.scrollRestoration = 'auto'
    return () => {
      window.history.scrollRestoration = previousRestoration
    }
  }, [])

  useEffect(() => {
    const locationKey = `${pathname}${hash}`
    const previousKey = previousLocationKey.current
    previousLocationKey.current = locationKey

    // Query-only navigation is used for overlays, menus, filters, and pages.
    // It must leave the current document position untouched.
    if (previousKey === locationKey) return undefined

    const behavior = navigationType === 'POP' ? 'auto' : 'smooth'

    if (!hash) {
      if (navigationType !== 'POP') window.scrollTo({ top: 0, behavior: 'auto' })
      return undefined
    }

    const timer = window.setTimeout(
      () => document.querySelector(hash)?.scrollIntoView({ behavior }),
      navigationType === 'POP' ? 0 : 40,
    )
    return () => window.clearTimeout(timer)
  }, [hash, navigationType, pathname])
}

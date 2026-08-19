import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

const withoutSmoothScrolling = (scroll: () => void) => {
  const root = document.documentElement
  const previousBehavior = root.style.scrollBehavior
  root.style.scrollBehavior = 'auto'
  scroll()
  root.style.scrollBehavior = previousBehavior
}

export function useRouteScroll() {
  const { pathname, hash, key } = useLocation()
  const navigationType = useNavigationType()
  const previousLocationKey = useRef<string | null>(null)
  const scrollPositions = useRef(new Map<string, number>())

  useLayoutEffect(() => {
    const previousRestoration = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    return () => {
      window.history.scrollRestoration = previousRestoration
    }
  }, [])

  useEffect(
    () => () => {
      scrollPositions.current.set(key, window.scrollY)
    },
    [key],
  )

  useEffect(() => {
    const locationKey = `${pathname}${hash}`
    const previousKey = previousLocationKey.current
    previousLocationKey.current = locationKey

    // Query-only navigation is used for overlays, menus, filters, and pages.
    // It must leave the current document position untouched.
    if (previousKey === locationKey) return undefined

    if (!hash) {
      const targetPosition =
        navigationType === 'POP' ? (scrollPositions.current.get(key) ?? 0) : 0
      withoutSmoothScrolling(() => window.scrollTo({ top: targetPosition }))
      return undefined
    }

    const timer = window.setTimeout(() => {
      const id = decodeURIComponent(hash.slice(1))
      const target = document.getElementById(id)
      if (!target) return

      if (navigationType === 'POP') {
        withoutSmoothScrolling(() => target.scrollIntoView())
      } else {
        target.scrollIntoView({ behavior: 'smooth' })
      }
    }, navigationType === 'POP' ? 0 : 40)
    return () => window.clearTimeout(timer)
  }, [hash, key, navigationType, pathname])
}

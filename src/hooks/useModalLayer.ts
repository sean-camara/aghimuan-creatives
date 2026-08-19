import { useEffect, useRef, type RefObject } from "react";

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "summary",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

const getFocusableElements = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(
    (element) =>
      element.getAttribute("aria-hidden") !== "true" &&
      element.getClientRects().length > 0,
  );

const makeBackgroundInert = (layer: HTMLElement) => {
  const changed = new Map<HTMLElement, boolean>();
  let current: HTMLElement = layer;

  while (current.parentElement) {
    const parent = current.parentElement;
    Array.from(parent.children).forEach((sibling) => {
      if (sibling === current || !(sibling instanceof HTMLElement)) return;
      if (!changed.has(sibling)) changed.set(sibling, sibling.inert);
      sibling.inert = true;
    });
    if (parent === document.body) break;
    current = parent;
  }

  return () => {
    changed.forEach((wasInert, element) => {
      element.inert = wasInert;
    });
  };
};

export function useModalLayer<T extends HTMLElement>({
  active,
  onClose,
  initialFocusRef,
}: {
  active: boolean;
  onClose: () => void;
  initialFocusRef?: RefObject<HTMLElement | null>;
}) {
  const layerRef = useRef<T>(null);

  useEffect(() => {
    if (!active || !layerRef.current) return undefined;

    const layer = layerRef.current;
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    const restoreBackground = makeBackgroundInert(layer);

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0)
      document.body.style.paddingRight = `${scrollbarWidth}px`;

    const focusInitialControl = window.requestAnimationFrame(() => {
      const target =
        initialFocusRef?.current ?? getFocusableElements(layer)[0] ?? layer;
      target.focus({ preventScroll: true });
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = getFocusableElements(layer);
      if (focusable.length === 0) {
        event.preventDefault();
        layer.focus({ preventScroll: true });
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeElement = document.activeElement;

      if (
        event.shiftKey &&
        (activeElement === first || !layer.contains(activeElement))
      ) {
        event.preventDefault();
        last?.focus();
      } else if (
        !event.shiftKey &&
        (activeElement === last || !layer.contains(activeElement))
      ) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusInitialControl);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      restoreBackground();
      previouslyFocused?.focus({ preventScroll: true });
    };
  }, [active, initialFocusRef, onClose]);

  return layerRef;
}

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { useModalLayer } from "../hooks/useModalLayer";

export function ImageViewer({
  src,
  alt,
  label,
  counter,
  total,
  onClose,
  onPrevious,
  onNext,
}: {
  src: string;
  alt: string;
  label: string;
  counter: string;
  total: number;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const closeButton = useRef<HTMLButtonElement>(null);
  const dialog = useModalLayer<HTMLDivElement>({
    active: true,
    onClose,
    initialFocusRef: closeButton,
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") onPrevious();
      if (event.key === "ArrowRight") onNext();
    };
    addEventListener("keydown", onKeyDown);
    return () => removeEventListener("keydown", onKeyDown);
  }, [onPrevious, onNext]);

  return createPortal(
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-label={`Viewing ${alt}`}
      tabIndex={-1}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 p-5 md:p-10"
      onClick={onClose}
    >
      <button
        ref={closeButton}
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
        className="absolute right-5 top-5 z-10 flex size-11 items-center justify-center text-white transition hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        aria-label="Close image viewer"
      >
        <X size={20} />
      </button>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onPrevious();
        }}
        className="absolute left-3 top-1/2 z-10 flex size-12 -translate-y-1/2 items-center justify-center text-white transition hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:left-7"
        aria-label="Previous image"
      >
        <ArrowLeft size={21} />
      </button>
      <figure
        className="relative m-0 flex h-full w-full max-w-6xl flex-col items-center justify-center"
        onClick={(event) => event.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          className="max-h-[calc(100vh-9rem)] max-w-full object-contain"
        />
        <figcaption className="mt-4 flex w-full items-center justify-between text-[10px] uppercase tracking-[.18em] text-white/80">
          <span>{label}</span>
          <span>
            {counter} / {String(total).padStart(2, "0")}
          </span>
        </figcaption>
      </figure>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onNext();
        }}
        className="absolute right-3 top-1/2 z-10 flex size-12 -translate-y-1/2 items-center justify-center text-white transition hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:right-7"
        aria-label="Next image"
      >
        <ArrowRight size={21} />
      </button>
    </div>,
    document.body,
  );
}

export function VideoViewer({
  src,
  poster,
  title,
  onClose,
}: {
  src: string;
  poster: string;
  title: string;
  onClose: () => void;
}) {
  const closeButton = useRef<HTMLButtonElement>(null);
  const dialog = useModalLayer<HTMLDivElement>({
    active: true,
    onClose,
    initialFocusRef: closeButton,
  });

  return createPortal(
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-label={`Viewing video ${title}`}
      tabIndex={-1}
      className="fixed inset-0 z-[70] grid place-items-center bg-black/95 p-4 md:p-8"
      onClick={onClose}
    >
      <button
        ref={closeButton}
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
        className="absolute right-5 top-5 z-10 grid size-11 place-items-center text-white transition hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        aria-label="Close video"
      >
        <X size={20} />
      </button>
      <figure
        className="m-0 flex h-full max-h-[calc(100vh-2rem)] w-full max-w-6xl flex-col items-center justify-center"
        onClick={(event) => event.stopPropagation()}
      >
        <video
          src={src}
          poster={poster}
          controls
          playsInline
          preload="metadata"
          className="min-h-0 max-h-[calc(100vh-6rem)] max-w-full bg-black object-contain"
        />
        <figcaption className="mt-3 text-[10px] uppercase tracking-[.18em] text-white/70">
          {title} · 1080p
        </figcaption>
      </figure>
    </div>,
    document.body,
  );
}

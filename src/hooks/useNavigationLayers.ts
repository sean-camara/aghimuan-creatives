import { useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export type ImageViewerSource = "featured" | "visual-archive" | "projects";

export type OverlayState =
  | {
      kind: "image";
      source: ImageViewerSource;
      id: string;
    }
  | {
      kind: "video";
      id: string;
    };

export type LayerHistoryState = {
  layerEntry: "menu" | "overlay";
};

const layerQueryKeys = ["overlay", "source", "id", "menu"] as const;

export const toSearchString = (params: URLSearchParams) => {
  const search = params.toString();
  return search ? `?${search}` : "";
};

export const removeLayerSearchParams = (search: string) => {
  const params = new URLSearchParams(search);
  layerQueryKeys.forEach((key) => params.delete(key));
  return toSearchString(params);
};

export const hasLayerSearchParams = (search: string) => {
  const params = new URLSearchParams(search);
  return layerQueryKeys.some((key) => params.has(key));
};

export const parseOverlay = (search: string): OverlayState | null => {
  const params = new URLSearchParams(search);
  const overlay = params.get("overlay");
  const id = params.get("id");

  if (!id) return null;

  if (overlay === "image") {
    const source = params.get("source");
    if (
      source === "featured" ||
      source === "visual-archive" ||
      source === "projects"
    ) {
      return { kind: "image", source, id };
    }
  }

  if (overlay === "video") return { kind: "video", id };

  return null;
};

export const readLayerHistoryState = (
  state: unknown,
): LayerHistoryState | null => {
  if (!state || typeof state !== "object") return null;
  const layerEntry = (state as { layerEntry?: unknown }).layerEntry;
  return layerEntry === "menu" || layerEntry === "overlay"
    ? { layerEntry }
    : null;
};

export function useNavigationLayers() {
  const location = useLocation();
  const navigate = useNavigate();
  const overlay = useMemo(
    () => parseOverlay(location.search),
    [location.search],
  );
  const menuOpen = useMemo(
    () => new URLSearchParams(location.search).get("menu") === "open",
    [location.search],
  );
  const hasLayer = hasLayerSearchParams(location.search);

  const navigateLayer = useCallback(
    (
      search: string,
      options: { replace?: boolean; state?: LayerHistoryState } = {},
    ) => {
      navigate(
        {
          pathname: location.pathname,
          search,
          hash: location.hash,
        },
        {
          replace: options.replace ?? false,
          preventScrollReset: true,
          ...(options.state ? { state: options.state } : {}),
        },
      );
    },
    [location.hash, location.pathname, navigate],
  );

  const openOverlay = useCallback(
    (nextOverlay: OverlayState) => {
      const params = new URLSearchParams(location.search);
      params.delete("menu");
      params.set("overlay", nextOverlay.kind);
      params.set("id", nextOverlay.id);
      if (nextOverlay.kind === "image") {
        params.set("source", nextOverlay.source);
      } else {
        params.delete("source");
      }
      navigateLayer(toSearchString(params), {
        state: { layerEntry: "overlay" },
      });
    },
    [location.search, navigateLayer],
  );

  const replaceOverlay = useCallback(
    (nextOverlay: OverlayState) => {
      const params = new URLSearchParams(location.search);
      params.delete("menu");
      params.set("overlay", nextOverlay.kind);
      params.set("id", nextOverlay.id);
      if (nextOverlay.kind === "image") {
        params.set("source", nextOverlay.source);
      } else {
        params.delete("source");
      }
      navigateLayer(toSearchString(params), {
        replace: true,
        state: { layerEntry: "overlay" },
      });
    },
    [location.search, navigateLayer],
  );

  const openMenu = useCallback(() => {
    const params = new URLSearchParams(location.search);
    params.delete("overlay");
    params.delete("source");
    params.delete("id");
    params.set("menu", "open");
    navigateLayer(toSearchString(params), {
      state: { layerEntry: "menu" },
    });
  }, [location.search, navigateLayer]);

  const clearLayer = useCallback(() => {
    const params = new URLSearchParams(location.search);
    layerQueryKeys.forEach((key) => params.delete(key));
    navigateLayer(toSearchString(params), { replace: true });
  }, [location.search, navigateLayer]);

  const closeLayer = useCallback(() => {
    if (!hasLayer) return;

    const historyState = readLayerHistoryState(location.state);
    const expectedEntry = menuOpen ? "menu" : overlay ? "overlay" : null;

    if (historyState?.layerEntry === expectedEntry) {
      navigate(-1);
      return;
    }

    clearLayer();
  }, [clearLayer, hasLayer, location.state, menuOpen, navigate, overlay]);

  return {
    overlay,
    menuOpen,
    hasLayer,
    openOverlay,
    replaceOverlay,
    openMenu,
    closeLayer,
    clearLayer,
  };
}

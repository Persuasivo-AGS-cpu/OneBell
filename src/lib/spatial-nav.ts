import { useEffect, useRef, useState } from "react";
import { isBackKey } from "./keys";

/** Detección de dispositivos TV por User Agent */
export function isTVUserAgent(): boolean {
  if (typeof window === "undefined" || !navigator) return false;
  const ua = navigator.userAgent.toLowerCase();
  return (
    ua.includes("tizen") ||
    ua.includes("webos") ||
    ua.includes("android tv") ||
    ua.includes("googletv") ||
    ua.includes("apple-tv") ||
    ua.includes("smart-tv") ||
    ua.includes("hbbtv") ||
    ua.includes("firetv") ||
    ua.includes("aftt") ||
    ua.includes("aftm") ||
    ua.includes("crkey")
  );
}

/** Hook para controlar el modo TV (auto-detectado o forzado manualmente) */
export function useTVMode() {
  const [tvMode, setTvMode] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem("onebell:tv_mode");
      if (stored !== null) return JSON.parse(stored);
    } catch { /* ignorar */ }
    return isTVUserAgent();
  });

  const toggleTVMode = () => {
    setTvMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("onebell:tv_mode", JSON.stringify(next));
      } catch { /* ignorar */ }
      return next;
    });
  };

  useEffect(() => {
    if (tvMode) {
      document.documentElement.classList.add("tv-mode");
    } else {
      document.documentElement.classList.remove("tv-mode");
    }
  }, [tvMode]);

  return { tvMode, toggleTVMode };
}

/**
 * Motor de Navegación Espacial (D-Pad Control)
 * Maneja eventos keydown (ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Enter, Backspace/Escape)
 */
export function useSpatialNav(enabled: boolean, onBack: () => void) {
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;

  // Retener historial en modo TV para que Atrás no cierre el navegador Amazon Silk
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    window.history.pushState({ onebellTv: true }, "");
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      window.history.pushState({ onebellTv: true }, "");
      onBackRef.current();
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    function getActiveSheet(): HTMLElement | null {
      const sheets = Array.from(document.querySelectorAll<HTMLElement>('.sheet-in, [data-sheet="true"], [role="dialog"]'));
      return sheets.filter((s) => s.offsetWidth > 0 && s.offsetHeight > 0).pop() ?? null;
    }

    function getFocusables(): HTMLElement[] {
      const activeSheet = getActiveSheet();
      const root = activeSheet || document;

      const selectors = [
        'button:not([disabled])',
        'a[href]',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex="0"]:not([disabled])',
        '[role="button"]:not([disabled])',
        '[role="radio"]:not([disabled])'
      ].join(', ');
      
      const elements = Array.from(root.querySelectorAll<HTMLElement>(selectors));
      return elements.filter((el) => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetWidth > 0 && el.offsetHeight > 0;
      });
    }

    const focusPrimaryOrFirst = () => {
      const focusables = getFocusables();
      if (focusables.length === 0) return;
      // Buscar botón principal o con data-primary, o el primero que no sea input
      const primary = focusables.find((el) => el.getAttribute("data-primary") === "true" || el.classList.contains("bg-primary")) || focusables.find((el) => el.tagName !== "INPUT") || focusables[0];
      if (primary && (document.activeElement === document.body || !document.activeElement)) {
        primary.focus();
      }
    };

    focusPrimaryOrFirst();
    const readyTimer = window.setTimeout(focusPrimaryOrFirst, 50);

    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const typing = !!target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);

      if (isBackKey(e.key, e.keyCode)) {
        if (typing) {
          e.preventDefault();
          target?.blur();
          return;
        }
        e.preventDefault();
        onBackRef.current();
        return;
      }

      if (typing) {
        if (e.key === "Enter" && target) target.blur();
        return;
      }

      const focusables = getFocusables();
      if (focusables.length === 0) return;

      const activeEl = (document.activeElement as HTMLElement) || focusables[0];
      const activeRect = activeEl.getBoundingClientRect();

      let direction: 'up' | 'down' | 'left' | 'right' | null = null;

      switch (e.key) {
        case 'ArrowUp':
          direction = 'up';
          break;
        case 'ArrowDown':
          direction = 'down';
          break;
        case 'ArrowLeft':
          direction = 'left';
          break;
        case 'ArrowRight':
          direction = 'right';
          break;
        case "Enter":
        case " ": {
          if (!activeEl || activeEl === document.body) return;
          // En Silk, el D-Pad a veces no dispara el click nativo
          e.preventDefault();
          activeEl.click();
          return;
        }
        default:
          return;
      }

      if (!direction) return;

      e.preventDefault();

      // Si no hay elemento activo o está en body, enfocar el primero
      if (!activeEl || activeEl === document.body || !focusables.includes(activeEl)) {
        focusables[0]?.focus();
        return;
      }

      // Encontrar el elemento más cercano en la dirección dada
      let bestCandidate: HTMLElement | null = null;
      let minDistance = Infinity;

      for (const candidate of focusables) {
        if (candidate === activeEl) continue;

        const candRect = candidate.getBoundingClientRect();

        let isCandidateInDirection = false;
        let dist = 0;

        const activeCenter = { x: activeRect.left + activeRect.width / 2, y: activeRect.top + activeRect.height / 2 };
        const candCenter = { x: candRect.left + candRect.width / 2, y: candRect.top + candRect.height / 2 };

        const dx = candCenter.x - activeCenter.x;
        const dy = candCenter.y - activeCenter.y;

        if (direction === 'up' && dy < -5) {
          isCandidateInDirection = true;
          dist = Math.abs(dy) + Math.abs(dx) * 1.5;
        } else if (direction === 'down' && dy > 5) {
          isCandidateInDirection = true;
          dist = Math.abs(dy) + Math.abs(dx) * 1.5;
        } else if (direction === 'left' && dx < -5) {
          isCandidateInDirection = true;
          dist = Math.abs(dx) + Math.abs(dy) * 1.5;
        } else if (direction === 'right' && dx > 5) {
          isCandidateInDirection = true;
          dist = Math.abs(dx) + Math.abs(dy) * 1.5;
        }

        if (isCandidateInDirection && dist < minDistance) {
          minDistance = dist;
          bestCandidate = candidate;
        }
      }

      if (bestCandidate) {
        bestCandidate.focus();
        bestCandidate.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(readyTimer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled]);
}

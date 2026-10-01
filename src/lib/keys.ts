const BACK_KEYS = new Set(["Escape", "Backspace", "GoBack", "BrowserBack"]);
const BACK_CODES = new Set([461, 10009, 4]);

/** Tecla de regreso del teclado o del control de una TV. */
export function isBackKey(key: string, keyCode: number): boolean {
  return BACK_KEYS.has(key) || BACK_CODES.has(keyCode);
}

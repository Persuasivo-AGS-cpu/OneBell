import test from "node:test";
import assert from "node:assert/strict";
import { isBackKey } from "../src/lib/keys.ts";

test("la tecla atrás del control remoto", () => {
  for (const key of ["Escape", "Backspace", "GoBack", "BrowserBack"]) {
    assert.equal(isBackKey(key, 0), true, key);
  }
  for (const code of [461, 10009, 4]) {
    assert.equal(isBackKey("Unidentified", code), true, String(code));
  }
  assert.equal(isBackKey("ArrowLeft", 0), false);
  assert.equal(isBackKey("Enter", 0), false);
  assert.equal(isBackKey("a", 0), false);
});

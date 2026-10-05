import { useEffect, useRef } from "react";

/** Ref untuk hidden input yang memunculkan keyboard virtual di perangkat sentuh.
 * Karakter dibaca satu per satu lewat onChange; input langsung dikosongkan. */
export function useSoftKeyboard(enabled: boolean, onChar: (ch: string) => void, onEnter: () => void) {
  const ref = useRef<HTMLInputElement>(null);
  const charRef = useRef(onChar);
  charRef.current = onChar;
  const enterRef = useRef(onEnter);
  enterRef.current = onEnter;

  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    // fokus tanpa menggulir halaman — jangan rebut fokus saat pemain sedang scroll
    const id = setTimeout(() => el.focus({ preventScroll: true }), 150);
    return () => clearTimeout(id);
  }, [enabled]);

  return ref;
}

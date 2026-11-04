import { useEffect, useRef } from "react";
import { logRender } from "../store/renderTelemetry.js";

/**
 * Instruments a component for the render telemetry panel.
 *
 * @param key      stable unique id for this component instance (e.g. "event-evt-3")
 * @param name     human-readable component name (e.g. "EventCard")
 * @param watchKey a primitive/string fingerprint of the data THIS component
 *                 actually needs. If it's unchanged since the last render but
 *                 the component rendered anyway, the render was caused by
 *                 something else re-rendering (an "unrelated re-render") —
 *                 usually a parent re-rendering without React.memo, or an
 *                 inline callback/object breaking referential equality.
 *
 * IMPORTANT: this hook must never call setState. An earlier version used a
 * `flashToken` state value to restart the flash animation, updated inside
 * an unconditional `useEffect`. That created a real infinite loop: every
 * commit re-ran the effect, which called setState, which triggered another
 * commit, forever — which is exactly what looked like "automatic"
 * re-rendering. The DOM flash below restarts a CSS animation directly via
 * a ref instead, so logging a render can never itself cause one.
 */
export function useRenderFlash(key, name, watchKey) {
  const prevWatch = useRef(undefined);
  const renderCount = useRef(0);
  const nodeRef = useRef(null);
  const causeRef = useRef("mount");

  renderCount.current += 1;

  let cause = "mount";
  if (prevWatch.current !== undefined) {
    cause = prevWatch.current === watchKey ? "unrelated" : "data-changed";
  }
  causeRef.current = cause;
  prevWatch.current = watchKey;

  useEffect(() => {
    logRender(key, name, cause);

    // Flash the DOM node directly — no state, so this can't cause another
    // render. Skipped on first mount so the whole grid doesn't flash at once.
    const el = nodeRef.current;
    if (renderCount.current > 1 && el) {
      el.style.setProperty(
        "--flash-color",
        cause === "unrelated" ? "#F5A623" : "#5EEAD4"
      );
      el.classList.remove("animate-flash");
      // eslint-disable-next-line no-unused-expressions
      void el.offsetWidth; // force reflow so the animation restarts
      el.classList.add("animate-flash");
    }
    // Runs after every render on purpose — that's the whole point of a
    // render counter — but it only ever *writes to the DOM or the store*,
    // never to React state, so it cannot cascade into another render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });

  return { cause: causeRef.current, renderCount: renderCount.current, nodeRef };
}

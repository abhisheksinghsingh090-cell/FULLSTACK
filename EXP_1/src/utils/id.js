let counter = 0;

/**
 * Generates a stable, unique id for a new task. Never reuse array index as
 * an id/key — see the note in data/initialEvents.js on why that breaks
 * reconciliation.
 */
export function generateTaskId() {
  counter += 1;
  return `evt-${Date.now().toString(36)}-${counter}`;
}

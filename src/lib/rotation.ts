// Which dishes the planner may use: the ones you ADDED on the Menu card.
// If you haven't added any yet, every dish is allowed (fish is always excluded elsewhere).
// The planner is synchronous, so the database's list is mirrored here in memory.

const added = new Set<string>();

export function setAddedDishNames(names: string[]): void {
  added.clear();
  names.forEach((n) => added.add(n.trim().toLowerCase()));
}

export function markDishAdded(name: string, isAdded: boolean): void {
  const k = name.trim().toLowerCase();
  if (isAdded) added.add(k); else added.delete(k);
}

/** True when the dish was added, or when nothing has been added yet. */
export function isInRotation(name: string): boolean {
  return added.size === 0 || added.has(name.trim().toLowerCase());
}

export function addedCount(): number {
  return added.size;
}

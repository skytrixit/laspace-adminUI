/** Ids after moving one row, for the reorder endpoint. */
export function movedIds<T extends { id: number }>(rows: T[], from: number, to: number): number[] {
  const ids = rows.map((r) => r.id)
  const [id] = ids.splice(from, 1)
  ids.splice(to, 0, id)
  return ids
}

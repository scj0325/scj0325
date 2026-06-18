import type { Position } from '../types'

export function countProjectMembers(positions: Position[]) {
  return positions.reduce(
    (count, position) => ({
      filled: count.filled + position.filled,
      total: count.total + position.total,
    }),
    { filled: 0, total: 0 },
  )
}

export function formatProjectMemberCount(positions: Position[]) {
  const { filled, total } = countProjectMembers(positions)

  return `${filled} / ${total}명`
}

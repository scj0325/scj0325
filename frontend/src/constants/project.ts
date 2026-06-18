import type { PositionType } from '../types/enums/project'

export const leaderPositionOptions: Array<{
  value: PositionType
  label: string
}> = [
  { value: 'BACKEND', label: '백엔드 개발자' },
  { value: 'FRONTEND', label: '프론트엔드 개발자' },
  { value: 'FULL_STACK', label: '풀스택 개발자' },
  { value: 'DESIGNER', label: '디자이너' },
  { value: 'PRODUCT_MANAGER', label: '프로덕트 매니저' },
]

export function formatPositionLabel(value: string | null | undefined) {
  return (
    leaderPositionOptions.find((option) => option.value === value)?.label ??
    value ??
    ''
  )
}

export function toPositionValue(value: string | null | undefined) {
  return (
    leaderPositionOptions.find(
      (option) => option.value === value || option.label === value,
    )?.value ??
    value ??
    ''
  )
}

export function formatDate(value: string | number | Date) {
  return new Date(value).toLocaleDateString()
}

export function getTimeValue(value: string | number | Date) {
  return new Date(value).getTime()
}

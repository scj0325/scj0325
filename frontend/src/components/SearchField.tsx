import { Search } from 'lucide-react'

import { Input } from './ui'

interface SearchFieldProps {
  placeholder: string
  value: string
  onChange: (value: string) => void
}

export function SearchField({ placeholder, value, onChange }: SearchFieldProps) {
  return (
    <div className="relative flex-1 w-full md:w-auto">
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
      <Input
        placeholder={placeholder}
        className="pl-9 w-full"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}

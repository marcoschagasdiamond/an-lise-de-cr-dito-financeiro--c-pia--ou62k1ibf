import * as React from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface NumInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'onChange' | 'value'
> {
  value: number | string
  onChange: (value: number | string) => void
  isPercentage?: boolean
  prefix?: string
}

export function NumInput({
  className,
  value,
  onChange,
  isPercentage,
  prefix,
  ...props
}: NumInputProps) {
  const displayValue = React.useMemo(() => {
    if (value === '' || value === null || value === undefined) return ''
    const num = Number(value)
    if (isNaN(num)) return value.toString()

    const formatted = new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num)

    if (isPercentage) return `${formatted} %`
    if (prefix) return `${prefix} ${formatted}`
    return formatted
  }, [value, isPercentage, prefix])

  const [localValue, setLocalValue] = React.useState(displayValue)
  const [isFocused, setIsFocused] = React.useState(false)

  React.useEffect(() => {
    if (!isFocused) {
      setLocalValue(displayValue)
    }
  }, [displayValue, isFocused])

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false)
    let parsed = e.target.value.replace(/\./g, '').replace(',', '.')
    if (isPercentage) parsed = parsed.replace('%', '').trim()
    if (prefix) parsed = parsed.replace(prefix, '').trim()

    const num = Number(parsed)
    if (!isNaN(num)) {
      onChange(num)
    }
    if (props.onBlur) props.onBlur(e)
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)
    setLocalValue(value.toString())
    if (props.onFocus) props.onFocus(e)
  }

  return (
    <Input
      className={cn('text-right', className)}
      value={isFocused ? localValue : displayValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onFocus={handleFocus}
      {...props}
    />
  )
}

// Currency formatting functions for Indonesian Rupiah (IDR)

export function formatCurrency(value: string): string {
  // Remove all non-numeric characters except decimal point
  const numericValue = value.replace(/[^\d]/g, '')
  
  if (!numericValue) return ''
  
  // Convert to number and format with thousands separators
  const number = parseInt(numericValue, 10)
  
  // Format with dots as thousands separators (Indonesian format)
  return number.toLocaleString('id-ID')
}

export function parseCurrency(value: string): number {
  // Remove all non-numeric characters
  const numericValue = value.replace(/[^\d]/g, '')
  return parseInt(numericValue, 10) || 0
}

export function formatCurrencyDisplay(value: number): string {
  return `Rp ${value.toLocaleString('id-ID')}`
}
/**
 * Máscara de telefone brasileiro, aplicada enquanto a pessoa digita.
 * Também formata números salvos com DDI: 5547999998888 → (47) 99999-8888
 */
export function formatPhone(value: string | null | undefined) {
  if (!value) return ''
  let digits = value.replace(/\D/g, '')
  if ((value.trim().startsWith('+') || digits.length > 11) && digits.startsWith('55')) {
    digits = digits.slice(2)
  }
  digits = digits.slice(0, 11)

  const ddd = digits.slice(0, 2)
  const rest = digits.slice(2)

  if (digits.length <= 2) return digits ? `(${ddd}` : ''
  if (rest.length <= 4) return `(${ddd}) ${rest}`
  // Fixo (8 dígitos) enquanto não completa os 9 do celular
  const split = rest.length === 9 ? 5 : 4
  return `(${ddd}) ${rest.slice(0, split)}-${rest.slice(split)}`
}

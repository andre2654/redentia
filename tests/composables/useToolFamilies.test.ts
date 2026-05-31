import { describe, expect, it } from 'vitest'
import { useToolFamilies } from '../../app/composables/useToolFamilies'

const { familyForTool, isInlineFamily } = useToolFamilies()

describe('useToolFamilies.familyForTool', () => {
  it('maps a known tool name to its family', () => {
    expect(familyForTool('view_asset').id).toBe('asset')
    expect(familyForTool('dividend_calendar').id).toBe('dividend')
    expect(familyForTool('macro_snapshot').label).toBe('Macroeconomia')
    expect(familyForTool('generate_spreadsheet')).toMatchObject({ id: 'spreadsheet', inline: false })
  })

  it('returns the fallback family for unknown or empty names', () => {
    expect(familyForTool('totally_unknown_tool').id).toBe('other')
    expect(familyForTool(null).id).toBe('other')
    expect(familyForTool(undefined).id).toBe('other')
  })
})

describe('useToolFamilies.isInlineFamily', () => {
  it('is true for inline tools and false for dedicated-surface tools', () => {
    expect(isInlineFamily('view_asset')).toBe(true)
    expect(isInlineFamily('register_decision')).toBe(false) // decision → inline:false
    expect(isInlineFamily('ask_form')).toBe(false) // form → inline:false
    expect(isInlineFamily('totally_unknown')).toBe(true) // fallback is inline
  })
})

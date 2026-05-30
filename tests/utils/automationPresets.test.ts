import { describe, expect, it } from 'vitest'
import {
  AUTOMATION_PRESETS,
  buildAutomationConfig,
  findPreset,
  groupPresetParams,
  inferPresetFromConfig,
} from '../../app/utils/automationPresets'

describe('preset registry + findPreset', () => {
  it('exposes the known presets and looks them up by id', () => {
    expect(AUTOMATION_PRESETS).toHaveLength(7)
    expect(findPreset('daily-ranking-top')?.label).toBe('Ranking diário · Altas')
    expect(findPreset('text-only')?.hasMedia).toBe(false)
    expect(findPreset('nope')).toBeNull()
    expect(findPreset(null)).toBeNull()
  })
})

describe('buildMedia / buildContextSources', () => {
  it('builds a creative URL with the params and drops blank values', () => {
    const p = findPreset('daily-ranking-top')!
    const media = p.buildMedia({ top_n: 8, min_volume: 5_000_000, image_title: 'ALTAS', image_label: '' })
    expect(media).toHaveLength(1)
    expect(media[0]!.kind).toBe('image')
    expect(media[0]!.source).toContain('https://creative.redentia.com.br/ranking/top')
    expect(media[0]!.source).toContain('limit=8')
    expect(media[0]!.source).toContain('volume=5000000')
    expect(media[0]!.source).toContain('title=ALTAS')
    expect(media[0]!.source).not.toContain('label=') // blank label dropped

    const ctx = p.buildContextSources({ top_n: 8, min_volume: 5_000_000 })
    expect(ctx).toEqual([{ type: 'ranking', params: { side: 'top', limit: 8, min_volume: 5_000_000 } }])
  })
})

describe('buildAutomationConfig', () => {
  it('assembles the stored JSONB shape for a text-only post', () => {
    const preset = findPreset('text-only')!
    const cfg = buildAutomationConfig({ preset, params: {}, integrations: ['instagram'], caption: 'Olá', delayMinutes: 5 })
    expect(cfg).toMatchObject({
      preset: 'text-only',
      preset_params: {},
      integrations: ['instagram'],
      context_sources: [],
      content: { type: 'text', value: 'Olá', media: [] },
      delay_minutes: 5,
    })
  })

  it('marks content type "image" for a media preset and defaults delay to null', () => {
    const preset = findPreset('daily-ranking-top')!
    const cfg = buildAutomationConfig({
      preset,
      params: { top_n: 6, min_volume: 1_000_000, image_title: 'X', image_label: '' },
      integrations: [],
      caption: 'c',
    })
    expect((cfg.content as { type: string; media: unknown[] }).type).toBe('image')
    expect((cfg.content as { type: string; media: unknown[] }).media).toHaveLength(1)
    expect(cfg.delay_minutes).toBeNull()
  })
})

describe('inferPresetFromConfig', () => {
  it('matches a single top-ranking media URL and extracts its params', () => {
    const config = {
      content: { media: [{ source: 'https://creative.redentia.com.br/ranking/top?limit=8&volume=5000000&title=ALTAS' }] },
    }
    const r = inferPresetFromConfig(config)
    expect(r?.preset.id).toBe('daily-ranking-top')
    expect(r?.params).toMatchObject({ top_n: 8, min_volume: 5000000, image_title: 'ALTAS' })
  })

  it('detects a top+bottom carousel across multiple media', () => {
    const config = {
      content: {
        media: [
          { source: 'https://creative.redentia.com.br/ranking/top?limit=6&title=A' },
          { source: 'https://creative.redentia.com.br/ranking/bottom?limit=6&title=B' },
        ],
      },
    }
    const r = inferPresetFromConfig(config)
    expect(r?.preset.id).toBe('daily-ranking-carousel')
    expect(r?.params).toMatchObject({ image_title_top: 'A', image_title_bottom: 'B' })
  })

  it('returns null for null/empty/invalid configs', () => {
    expect(inferPresetFromConfig(null)).toBeNull()
    expect(inferPresetFromConfig({ content: { media: [] } })).toBeNull()
    expect(inferPresetFromConfig({ content: { media: [{ source: 'not-a-url' }] } })).toBeNull()
  })
})

describe('groupPresetParams', () => {
  it('buckets params into content/data groups, skipping empty ones', () => {
    const groups = groupPresetParams(findPreset('daily-ranking-top')!)
    expect(groups.map((g) => g.group)).toEqual(['content', 'data'])
    expect(groupPresetParams(findPreset('text-only')!)).toEqual([])
  })
})

import { getGainLossColor } from '@/lib/portfolio/gain-loss-color'

describe('getGainLossColor', () => {
  it('returns green for profit', () => {
    expect(getGainLossColor(100)).toBe('green') // Positive gain
  })

  it('returns red for loss', () => {
    expect(getGainLossColor(-50)).toBe('red') // Negative gain/loss
  })

  it('returns gray for zero', () => {
    expect(getGainLossColor(0)).toBe('gray') // No gain or loss
  })
})

import { describe, expect, it } from 'vitest'
import { createChoices } from '../lib/createChoices.js'

describe('createChoices', () => {
  it('returns an empty array when there are no package summaries', () => {
    expect(createChoices({ packageSummary: [] })).toEqual([])
  })

  it('filters deprecated packages and up-to-date installed packages', () => {
    const choices = createChoices({
      packageSummary: [
        {
          typesName: '@types/foo',
          installedVersion: '1.0.0',
          latest: '2.0.0',
          deprecated: false,
          satisfies: false,
        },
        {
          typesName: '@types/bar',
          installedVersion: '2.0.0',
          latest: '2.0.0',
          deprecated: false,
          satisfies: true,
        },
        {
          typesName: '@types/baz',
          installedVersion: '1.0.0',
          latest: '2.0.0',
          deprecated: true,
          satisfies: false,
        },
      ],
    })

    expect(choices).toHaveLength(1)
    expect(choices[0].value.typesName).toBe('@types/foo')
    expect(choices[0].short).toBe('@types/foo@2.0.0')
    expect(choices[0].name).toContain('@types/foo')
    expect(choices[0].name).toContain('1.0.0')
    expect(choices[0].name).toContain('2.0.0')
  })

  it('keeps missing packages and installed packages outside the requested range', () => {
    const choices = createChoices({
      packageSummary: [
        {
          typesName: '@types/missing',
          installedVersion: undefined,
          latest: '3.0.0',
          deprecated: false,
          satisfies: false,
        },
        {
          typesName: '@types/outdated',
          installedVersion: '2.0.0',
          latest: '3.0.0',
          deprecated: false,
          satisfies: true,
        },
      ],
    })

    expect(choices).toHaveLength(2)
    expect(choices[0].name).toContain('missing')
    expect(choices[1].value.typesName).toBe('@types/outdated')
  })
})

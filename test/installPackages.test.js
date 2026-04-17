import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
  execaMock,
  preferredPMMock,
  spinnerStartMock,
  spinnerStopMock,
  oraMock,
} = vi.hoisted(() => {
  const execaMock = vi.fn()
  const preferredPMMock = vi.fn()
  const spinnerStartMock = vi.fn()
  const spinnerStopMock = vi.fn()
  const oraMock = vi.fn(() => ({
    start: spinnerStartMock,
    stop: spinnerStopMock,
  }))

  return {
    execaMock,
    preferredPMMock,
    spinnerStartMock,
    spinnerStopMock,
    oraMock,
  }
})

vi.mock('execa', () => ({
  execa: execaMock,
}))

vi.mock('preferred-pm', () => ({
  default: preferredPMMock,
}))

vi.mock('ora', () => ({
  default: oraMock,
}))

import { installPackages } from '../lib/installPackages.js'

describe('installPackages', () => {
  beforeEach(() => {
    execaMock.mockReset()
    preferredPMMock.mockReset()
    oraMock.mockClear()
    spinnerStartMock.mockClear()
    spinnerStopMock.mockClear()
    execaMock.mockResolvedValue({ all: 'ok' })
  })

  it('falls back to npm when the preferred package manager is unsupported', async () => {
    preferredPMMock.mockResolvedValue({ name: 'pnpm' })

    await installPackages({
      cwd: '/tmp/project',
      packageSummary: [{ typesName: '@types/foo', latest: '1.2.3' }],
    })

    expect(preferredPMMock).toHaveBeenCalledWith('/tmp/project')
    expect(execaMock).toHaveBeenCalledWith(
      'npm',
      ['install', '-D', '@types/foo@1.2.3'],
      expect.objectContaining({ cwd: '/tmp/project' })
    )
    expect(spinnerStartMock).toHaveBeenCalledTimes(1)
    expect(spinnerStopMock).toHaveBeenCalledTimes(1)
  })

  it('uses yarn add -W when yarn is the preferred package manager', async () => {
    preferredPMMock.mockResolvedValue({ name: 'yarn' })

    await installPackages({
      cwd: '/tmp/project',
      packageSummary: [
        { typesName: '@types/foo', latest: '1.2.3' },
        { typesName: '@types/bar', latest: '4.5.6' },
      ],
    })

    expect(execaMock).toHaveBeenCalledWith(
      'yarn',
      ['add', '-W', '-D', '@types/foo@1.2.3', '@types/bar@4.5.6'],
      expect.objectContaining({ cwd: '/tmp/project' })
    )
  })

  it('stops the spinner before rethrowing install failures', async () => {
    const error = new Error('install failed')
    preferredPMMock.mockResolvedValue(undefined)
    execaMock.mockRejectedValue(error)

    await expect(
      installPackages({
        cwd: '/tmp/project',
        packageSummary: [{ typesName: '@types/foo', latest: '1.2.3' }],
      })
    ).rejects.toThrow('install failed')

    expect(spinnerStopMock).toHaveBeenCalledTimes(1)
  })
})

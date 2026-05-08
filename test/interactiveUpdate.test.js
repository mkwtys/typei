import { beforeEach, describe, expect, it, vi } from 'vitest'

const { readPackageMock, createPackageSummaryMock, createChoicesMock, installPackagesMock, promptMock } = vi.hoisted(
  () => ({
    readPackageMock: vi.fn(),
    createPackageSummaryMock: vi.fn(),
    createChoicesMock: vi.fn(),
    installPackagesMock: vi.fn(),
    promptMock: vi.fn(),
  })
)

vi.mock('read-pkg', () => ({ readPackage: readPackageMock }))
vi.mock('../lib/createPackageSummary.js', () => ({ createPackageSummary: createPackageSummaryMock }))
vi.mock('../lib/createChoices.js', () => ({ createChoices: createChoicesMock }))
vi.mock('../lib/installPackages.js', () => ({ installPackages: installPackagesMock }))
vi.mock('inquirer', () => ({ default: { prompt: promptMock } }))

import { interactiveUpdate } from '../lib/interactiveUpdate.js'

const mockSummary = [{ typesName: '@types/foo', latest: '1.0.0' }]
const mockChoices = [{ name: '@types/foo  1.0.0', value: mockSummary[0], short: '@types/foo@1.0.0' }]

describe('interactiveUpdate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    readPackageMock.mockResolvedValue({ dependencies: {}, devDependencies: {} })
    createPackageSummaryMock.mockResolvedValue(mockSummary)
    createChoicesMock.mockReturnValue(mockChoices)
    installPackagesMock.mockResolvedValue({ all: 'installed' })
  })

  it('logs up to date message and skips install when no choices', async () => {
    createChoicesMock.mockReturnValue([])
    const spyLog = vi.spyOn(console, 'log').mockImplementation(() => {})

    await interactiveUpdate({ cwd: '/tmp/project', update: true })

    expect(installPackagesMock).not.toHaveBeenCalled()
    expect(spyLog.mock.calls.some(([msg]) => msg.includes('up to date'))).toBe(true)
    spyLog.mockRestore()
  })

  it('installs all packages when update option is true', async () => {
    const spyLog = vi.spyOn(console, 'log').mockImplementation(() => {})

    await interactiveUpdate({ cwd: '/tmp/project', update: true })

    expect(installPackagesMock).toHaveBeenCalledWith({ cwd: '/tmp/project', packageSummary: mockSummary })
    spyLog.mockRestore()
  })

  it('prompts user and installs selected packages in interactive mode', async () => {
    promptMock.mockResolvedValue({ types: mockSummary })
    const spyLog = vi.spyOn(console, 'log').mockImplementation(() => {})

    await interactiveUpdate({ cwd: '/tmp/project' })

    expect(promptMock).toHaveBeenCalled()
    expect(installPackagesMock).toHaveBeenCalledWith({ cwd: '/tmp/project', packageSummary: mockSummary })
    spyLog.mockRestore()
  })

  it('returns without installing when nothing is selected interactively', async () => {
    promptMock.mockResolvedValue({ types: [] })

    await interactiveUpdate({ cwd: '/tmp/project' })

    expect(installPackagesMock).not.toHaveBeenCalled()
  })

  it('warns about installed deprecated types', async () => {
    createPackageSummaryMock.mockResolvedValue([
      { typesName: '@types/foo', latest: '1.0.0', deprecated: 'This package is deprecated' },
    ])
    createChoicesMock.mockReturnValue([])
    const spyLog = vi.spyOn(console, 'log').mockImplementation(() => {})

    await interactiveUpdate({ cwd: '/tmp/project', update: true })

    expect(spyLog.mock.calls.some(([msg]) => /deprecated/.test(msg) && /@types\/foo/.test(msg))).toBe(true)
    spyLog.mockRestore()
  })

  it('logs error when installPackages fails', async () => {
    const error = new Error('install failed')
    installPackagesMock.mockRejectedValue(error)
    const spyError = vi.spyOn(console, 'error').mockImplementation(() => {})

    await interactiveUpdate({ cwd: '/tmp/project', update: true })

    expect(spyError).toHaveBeenCalledWith(error)
    spyError.mockRestore()
  })

  it('returns silently when user presses Ctrl+C during prompt', async () => {
    const error = new Error('User force closed the prompt with SIGINT')
    error.name = 'ExitPromptError'
    promptMock.mockRejectedValue(error)

    await expect(interactiveUpdate({ cwd: '/tmp/project' })).resolves.toBeUndefined()
    expect(installPackagesMock).not.toHaveBeenCalled()
  })

  it('rethrows non-ExitPromptError errors from prompt', async () => {
    const error = new Error('unexpected error')
    promptMock.mockRejectedValue(error)

    await expect(interactiveUpdate({ cwd: '/tmp/project' })).rejects.toThrow('unexpected error')
  })
})

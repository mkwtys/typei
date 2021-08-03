import execa from 'execa'
import fs from 'fs'
import mkdirp from 'mkdirp'
import path from 'path'
import rimraf from 'rimraf'
import { jest } from '@jest/globals'
import { fileURLToPath } from 'url'
import { interactiveUpdate } from '../interactiveUpdate'

const cwd = path.join(path.dirname(fileURLToPath(import.meta.url)), 'testProject')
const actualPackagePath = path.join(cwd, 'package.json')
const packageManagers = ['npm', 'yarn']
const fixtures = [
  'has-index-types',
  'has-types',
  'has-typings',
  'installed-types',
  'no-deps',
  'not-registered-in-types-registry',
  'scoped-package',
]

jest.setTimeout(60000)

function test(packageManager, fixtureName) {
  it(`${packageManager}: ${fixtureName}`, async () => {
    const expectedPackage = await import(`./fixtures/${fixtureName}/expected.json`)
    const fixturePackage = await import(`./fixtures/${fixtureName}/fixture.json`)
    const dir = cwd ? `cd ${cwd} &&` : ''
    const command = `${dir} ${packageManager} install`
    const spyLog = jest.spyOn(console, 'log')

    spyLog.mockImplementation((x) => x)
    rimraf.sync(cwd)
    mkdirp.sync(cwd)
    fs.writeFileSync(actualPackagePath, JSON.stringify(fixturePackage))
    await execa.command(command, { env: { ...process.env }, shell: true })
    await interactiveUpdate({ cwd, update: true })

    const actualPackage = JSON.parse(fs.readFileSync(actualPackagePath, { encoding: 'utf8' }))
    expect(Object.keys({ ...actualPackage.dependencies, ...actualPackage.devDependencies }).sort()).toEqual(
      Object.keys({ ...expectedPackage.dependencies, ...expectedPackage.devDependencies }).sort()
    )

    spyLog.mockReset()
    spyLog.mockRestore()
  })
}

packageManagers.forEach((packageManager) => {
  fixtures.forEach((fixture) => {
    test(packageManager, fixture)
  })
})

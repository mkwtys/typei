import execa from 'execa'
import fs from 'fs'
import mkdirp from 'mkdirp'
import path from 'path'
import rimraf from 'rimraf'
import { interactiveUpdate } from '../'

const cwd = path.join(__dirname, 'testProject')
const actualPackagePath = path.join(cwd, 'package.json')
const packageManagers = ['npm', 'yarn']
const fixtures = [
  'has-index-types',
  'has-types',
  'has-typings',
  'installed-types',
  'no-deps',
  'not-registered-in-types-registry',
  'scoped-package'
]

function test(packageManager, fixtureName) {
  it(`${packageManager}: ${fixtureName}`, async () => {
    jest.setTimeout(60000)
    rimraf.sync(cwd)
    mkdirp.sync(cwd)
    const expectedPackage = require(`./fixtures/${fixtureName}/expected.json`)
    const fixturePackage = require(`./fixtures/${fixtureName}/fixture.json`)
    const dir = cwd ? `cd ${cwd} &&` : ''
    const command = `${dir} ${packageManager} install`

    fs.writeFileSync(actualPackagePath, JSON.stringify(fixturePackage))
    await execa.command(command, { env: { ...process.env }, shell: true })
    await interactiveUpdate({ cwd, update: true })

    const actualPackage = JSON.parse(fs.readFileSync(actualPackagePath, { encoding: 'utf8' }))
    expect(Object.keys({ ...actualPackage.dependencies, ...actualPackage.devDependencies }).sort()).toEqual(
      Object.keys({ ...expectedPackage.dependencies, ...expectedPackage.devDependencies }).sort()
    )
  })
}

packageManagers.forEach(packageManager => {
  fixtures.forEach(fixture => {
    test(packageManager, fixture)
  })
})

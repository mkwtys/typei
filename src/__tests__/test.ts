import execa from 'execa'
import fs from 'fs'
import mkdirp from 'mkdirp'
import path from 'path'
import rimraf from 'rimraf'
import { interactiveUpdate } from '../'

describe('actions', () => {
  const cwd = path.join(__dirname, 'testProject')
  const actualPackagePath = path.join(cwd, 'package.json')

  function test(fixtureName) {
    it(`${fixtureName}`, async () => {
      jest.setTimeout(60000)
      rimraf.sync(cwd)
      mkdirp.sync(cwd)
      const expectedPackage = require(`./fixtures/${fixtureName}/expected.json`)
      const fixturePackage = require(`./fixtures/${fixtureName}/fixture.json`)

      fs.writeFileSync(actualPackagePath, JSON.stringify(fixturePackage))

      const dir = cwd ? `cd ${cwd} &&` : ''

      // run `npm install` to get dependencies information from node_modules
      await execa.command(`${dir} npm install`, { env: { ...process.env }, shell: true })

      await interactiveUpdate({ cwd, update: true })
      const actualPackage = JSON.parse(fs.readFileSync(actualPackagePath, { encoding: 'utf8' }))

      expect(Object.keys({ ...actualPackage.dependencies, ...actualPackage.devDependencies }).sort()).toEqual(
        Object.keys({ ...expectedPackage.dependencies, ...expectedPackage.devDependencies }).sort()
      )
    })
  }

  test('has-index-types')
  test('has-types')
  test('has-typings')
  test('installed-types')
  test('no-deps')
  test('scoped-package')
})

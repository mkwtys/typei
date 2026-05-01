import { execaCommand } from 'execa'
import { vi, describe, it, expect } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { interactiveUpdate } from '../lib/interactiveUpdate.js'

const packageManagers = process.env.TEST_PM ? [process.env.TEST_PM] : ['npm', 'yarn']
const fixtures = [
  'has-index-types',
  'has-types',
  'has-typings',
  'installed-types',
  'no-deps',
  'not-registered-in-types-registry',
  'scoped-package',
]

function test(packageManager, fixtureName) {
  const testFn = packageManager === 'npm' ? it.concurrent : it
  testFn(`${packageManager}: ${fixtureName}`, async () => {
    const expectedPackageModule = await import(`./fixtures/${fixtureName}/expected.json`)
    const fixturePackageModule = await import(`./fixtures/${fixtureName}/fixture.json`)
    const expectedPackage = expectedPackageModule.default ?? expectedPackageModule
    const fixturePackage = fixturePackageModule.default ?? fixturePackageModule

    const cwd = fs.mkdtempSync(path.join(os.tmpdir(), `typei-${packageManager}-${fixtureName}-`))
    const actualPackagePath = path.join(cwd, 'package.json')

    try {
      fs.mkdirSync(cwd, { recursive: true })
      fs.writeFileSync(actualPackagePath, JSON.stringify(fixturePackage))
      await execaCommand(`${packageManager} install`, { cwd, env: { ...process.env }, shell: true })
      await interactiveUpdate({ cwd, update: true })

      const actualPackage = JSON.parse(fs.readFileSync(actualPackagePath, { encoding: 'utf8' }))
      expect(Object.keys({ ...actualPackage.dependencies, ...actualPackage.devDependencies }).sort()).toEqual(
        Object.keys({ ...expectedPackage.dependencies, ...expectedPackage.devDependencies }).sort(),
      )
    } finally {
      fs.rmSync(cwd, { recursive: true, force: true })
    }
  })
}

describe('typei', () => {
  packageManagers.forEach((packageManager) => {
    fixtures.forEach((fixture) => {
      test(packageManager, fixture)
    })
  })
})

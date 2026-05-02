import { readPackage } from 'read-pkg'
import fs from 'node:fs'
import packageJson from 'package-json'
import path from 'node:path'
import semver from 'semver'

export async function createPackageSummary(options) {
  const { pkg } = options
  const cwd = options.cwd ? options.cwd : process.cwd()

  const getPackagePath = (pkgName) => {
    const packagePath = path.join(cwd, 'node_modules', pkgName)
    return fs.existsSync(packagePath) && packagePath
  }

  const getPackageFromNodeModules = async (pkgName) => {
    const pkgPath = getPackagePath(pkgName)
    return pkgPath && readPackage({ cwd: pkgPath }).catch((_e) => {})
  }

  const getPackageFromRegistry = async (pkgName) => {
    return packageJson(pkgName).catch((_e) => {})
  }

  const normalizePkgName = (pkgName) => {
    return pkgName.startsWith('@') ? pkgName.slice(1).split('/').join('__') : pkgName
  }

  const getTypesName = (pkgName) => {
    return `@types/${normalizePkgName(pkgName)}`
  }

  const isTypesPkgName = (pkgName) => {
    return pkgName.startsWith('@types/')
  }

  const hasIndexTypes = (pkgName) => {
    const pkgPath = getPackagePath(pkgName)
    return pkgPath && fs.existsSync(path.join(pkgPath, 'index.d.ts'))
  }

  const summary = await Promise.all(
    Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).map(async (pkgName) => {
      const isTypes = isTypesPkgName(pkgName)

      if (!isTypes) {
        const pkgFromNodeModules = await getPackageFromNodeModules(pkgName)
        if (!pkgFromNodeModules || pkgFromNodeModules.types || pkgFromNodeModules.typings) {
          return
        }

        const hasTypes = hasIndexTypes(pkgName)
        if (hasTypes) {
          return
        }
      }

      const typesName = isTypes ? pkgName : getTypesName(pkgName)
      const typesPkgFromRegistry = await getPackageFromRegistry(typesName)
      if (!typesPkgFromRegistry) {
        return
      }

      const typesPkgFromNodeModules = await getPackageFromNodeModules(typesName)
      const deprecated =
        typesPkgFromRegistry.deprecated ||
        (typesPkgFromNodeModules && typesPkgFromNodeModules.deprecated) ||
        undefined

      if (deprecated && !isTypes && !typesPkgFromNodeModules) {
        return
      }

      if (!isTypes && typesPkgFromNodeModules && !deprecated) {
        return
      }

      const packageJsonVersion =
        (pkg.dependencies && pkg.dependencies[typesName]) || (pkg.devDependencies && pkg.devDependencies[typesName])
      const latest = typesPkgFromRegistry.version

      return {
        name: pkgName,
        typesName,
        installedVersion: typesPkgFromNodeModules ? typesPkgFromNodeModules.version : undefined,
        packageJsonVersion,
        latest,
        satisfies: packageJsonVersion && semver.satisfies(latest, packageJsonVersion),
        deprecated,
      }
    })
  )
  return summary.filter(Boolean)
}

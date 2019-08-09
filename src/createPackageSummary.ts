import Module from 'module'
import packageJson from 'package-json'
import path from 'path'
import pathExists from 'path-exists'
import readPkg from 'read-pkg'
import semver from 'semver'
import { Summary } from './types'

export async function createPackageSummary(options: { cwd?: string; pkg: readPkg.PackageJson }) {
  const { pkg } = options
  const cwd = options.cwd ? options.cwd : process.cwd()

  const getPackagePath = (pkgName: string) => {
    // @ts-ignore - Module._nodeModulePaths
    const nodeModulesPaths: string[] = Module._nodeModulePaths(cwd)
    const packagePath = path.join(nodeModulesPaths[0], pkgName)
    if (pathExists.sync(packagePath)) {
      return packagePath
    }
  }

  const getPackageFromNodeModules = async (pkgName: string) => {
    const pkgPath = getPackagePath(pkgName)
    if (pkgPath) {
      return readPkg({ cwd: pkgPath }).catch(e => {})
    }
  }

  const getPackageFromRegistry = async (pkgName: string) => {
    return packageJson(pkgName).catch(e => {})
  }

  const normalizePkgName = (pkgName: string) => {
    return /^@/.test(pkgName)
      ? pkgName
          .slice(1)
          .split('/')
          .join('__')
      : pkgName
  }

  const getTypesName = (pkgName: string) => {
    return `@types/${normalizePkgName(pkgName)}`
  }

  const isTypesPkgName = (pkgName: string) => {
    return /^@types\//.test(pkgName)
  }

  const hasIndexTypes = (pkgName: string) => {
    const pkgPath = getPackagePath(pkgName)
    if (pkgPath) {
      return pathExists.sync(path.join(pkgPath, 'index.d.ts'))
    }
  }

  const summary = await Promise.all(
    Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).map(async pkgName => {
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
      if (!typesPkgFromRegistry || typesPkgFromRegistry.deprecated) {
        return
      }

      const typesPkgFromNodeModules = await getPackageFromNodeModules(typesName)
      if (!isTypes && typesPkgFromNodeModules) {
        return
      }

      const packageJsonVersion =
        (pkg.dependencies && pkg.dependencies[typesName]) || (pkg.devDependencies && pkg.devDependencies[typesName])
      const latest = typesPkgFromRegistry.version as string

      return {
        name: pkgName,
        typesName,
        installedVersion: typesPkgFromNodeModules && typesPkgFromNodeModules.version,
        packageJsonVersion,
        latest,
        satisfies: !!(packageJsonVersion && semver.satisfies(latest, packageJsonVersion)),
        deprecated: typesPkgFromNodeModules && (typesPkgFromNodeModules['deprecated'] as string | boolean | undefined)
      }
    })
  )
  return summary.filter(Boolean) as Summary[]
}

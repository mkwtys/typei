export declare type Summary = {
  name: string
  typesName: string
  installedVersion?: string
  packageJsonVersion?: string
  latest: string
  satisfies: boolean
  deprecated?: string | boolean
}

export declare function interactiveUpdate(options: { cwd?: string; update?: boolean }): Promise<void>

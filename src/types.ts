export type Summary = {
  name: string
  typesName: string
  installedVersion?: string
  packageJsonVersion?: string
  latest: string
  satisfies: boolean
  deprecated?: string | boolean
}

export type Choice = {
  name: string
  value: Summary
  short: string
}

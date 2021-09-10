export declare type Summary = {
  name: string
  typesName: string
  installedVersion?: string
  packageJsonVersion?: string
  latest: string
  satisfies: boolean
  deprecated?: string | boolean
}

export declare type Choice = {
  name: string
  value: Summary
  short: string
}

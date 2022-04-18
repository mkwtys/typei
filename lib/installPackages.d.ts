import { ExecaReturnValue } from 'execa'
import { Summary } from './types'
export declare function installPackages({
  cwd,
  packageSummary,
}: {
  cwd?: string
  packageSummary: Summary[]
}): Promise<ExecaReturnValue<string>>

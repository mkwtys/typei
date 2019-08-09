import execa from 'execa'
import ora from 'ora'
import { Summary } from './types'

export async function installPackages({ cwd, packageSummary }: { cwd?: string; packageSummary: Summary[] }) {
  const dir = cwd ? `cd ${cwd} &&` : ''
  const packages = packageSummary.map(summary => `${summary.typesName}@${summary.latest}`).join(' ')
  const spinner = ora(`install types...`)

  spinner.start()

  return execa
    .command(`${dir} npm install --save-dev ${packages}`, { env: { ...process.env }, shell: true })
    .finally(() => {
      spinner.stop()
    })
}

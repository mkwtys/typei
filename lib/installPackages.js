import { execaCommand } from 'execa'
import ora from 'ora'
import preferredPM from 'preferred-pm'

async function getPreferredPackageManager({ cwd }) {
  const supported = ['npm', 'yarn']
  const pm = await preferredPM(cwd)
  return pm && supported.includes(pm.name) ? pm.name : 'npm'
}

export async function installPackages({ cwd, packageSummary }) {
  const dir = cwd ? `cd ${cwd} &&` : ''
  const packageManager = await getPreferredPackageManager({ cwd: process.cwd() })
  const packages = packageSummary.map((summary) => `${summary.typesName}@${summary.latest}`).join(' ')
  const command = `${dir} ${packageManager} ${packageManager === 'yarn' ? 'add -W' : 'install'} -D ${packages}`
  const spinner = ora(`install types...`)

  spinner.start()
  const output = await execaCommand(command, {
    all: true,
    env: { ...process.env },
    shell: true,
  }).catch((e) => {
    spinner.stop()
    throw e
  })
  spinner.stop()

  return output
}

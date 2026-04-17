import { execa } from 'execa'
import ora from 'ora'
import preferredPM from 'preferred-pm'

async function getPreferredPackageManager({ cwd }) {
  const supported = ['npm', 'yarn']
  const pm = await preferredPM(cwd)
  return pm && supported.includes(pm.name) ? pm.name : 'npm'
}

export async function installPackages({ cwd, packageSummary }) {
  const packageManager = await getPreferredPackageManager({ cwd })
  const packages = packageSummary.map((summary) => `${summary.typesName}@${summary.latest}`)
  const args = packageManager === 'yarn' ? ['add', '-W', '-D', ...packages] : ['install', '-D', ...packages]
  const spinner = ora(`install types...`)

  spinner.start()
  const output = await execa(packageManager, args, {
    cwd,
    all: true,
    env: { ...process.env },
  }).catch((e) => {
    spinner.stop()
    throw e
  })
  spinner.stop()

  return output
}

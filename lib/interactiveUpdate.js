import chalk from 'chalk'
import inquirer from 'inquirer'
import { readPackage } from 'read-pkg'
import { createChoices } from './createChoices.js'
import { createPackageSummary } from './createPackageSummary.js'
import { installPackages } from './installPackages.js'

export async function interactiveUpdate(options) {
  const cwd = options.cwd ? options.cwd : process.cwd()
  const pkg = await readPackage({ cwd })
  const packageSummary = await createPackageSummary({ cwd, pkg })
  const choices = createChoices({ packageSummary })

  if (!choices.length) {
    console.log(`${chalk.green(`❯`)} all of your types are up to date`)
    return
  }

  let selectedPackageSummary = []
  if (options.update) {
    selectedPackageSummary = packageSummary
  } else {
    const answers = await inquirer.prompt([
      {
        name: 'types',
        message: 'choose which types to update',
        type: 'checkbox',
        choices,
        pageSize: process.stdout.rows - 2,
      },
    ])
    selectedPackageSummary = answers.types
  }

  if (!selectedPackageSummary.length) {
    return
  }

  return installPackages({ cwd, packageSummary: selectedPackageSummary })
    .then((output) => {
      console.log(output.all)
      console.log(`${chalk.green(`❯`)} complete`)
    })
    .catch((e) => {
      console.error(e)
    })
}

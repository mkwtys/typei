import chalk from 'chalk'
import semver from 'semver'
import stripAnsi from 'strip-ansi'
import textTable from 'text-table'

export function createChoices({ packageSummary }) {
  const choices = packageSummary
    .filter((summary) => !summary.deprecated)
    .filter((summary) => {
      if (!summary.satisfies || !summary.installedVersion) {
        return true
      }
      return semver.lt(summary.installedVersion, summary.latest)
    })
    .map((summary) => ({
      name: [
        chalk.cyan(summary.typesName),
        summary.installedVersion ? chalk.white(summary.installedVersion) : chalk.white('missing'),
        chalk.white('❯'),
        chalk.white.bold(summary.latest),
      ],
      value: summary,
      short: `${summary.typesName}@${summary.latest}`,
    }))

  if (!choices.length) {
    return []
  }

  const choicesAsTable = textTable(
    choices.map((choice) => choice.name),
    {
      align: ['l', 'r', 'l', 'l'],
      stringLength(str) {
        return stripAnsi(str).length
      },
    }
  ).split('\n')
  return [...choices.map((choice, i) => ({ ...choice, name: choicesAsTable[i] }))]
}

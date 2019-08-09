#!/usr/bin/env node

import yargs from 'yargs'
import { interactiveUpdate } from './'

export async function run() {
  const argv = yargs
    .usage(
      `Usage:
  $ typei`
    )
    .option({
      update: {
        alias: 'u',
        describe: 'Uninteractive update. Apply all updates without prompting',
        type: 'boolean'
      }
    })
    .example('$ typei -u', 'Uninteractive update')
    .locale('en')
    .help()
    .alias({
      h: 'help',
      v: 'version'
    }).argv

  await interactiveUpdate({ update: argv.update })
}

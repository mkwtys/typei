#!/usr/bin/env node

import yargs from 'yargs'
import { interactiveUpdate } from './'

export async function run() {
  const argv = yargs
    .usage(`Usage:\n  $ typei`)
    .option({
      update: {
        describe: 'Uninteractive update. Apply all updates without prompting.',
        type: 'boolean',
      },
    })
    .example('$ typei -u', '')
    .locale('en')
    .alias({
      u: 'update',
      h: 'help',
      v: 'version',
    }).argv

  return interactiveUpdate({ update: argv.update })
}

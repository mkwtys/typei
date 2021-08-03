#!/usr/bin/env node

import yargs from 'yargs'
import { interactiveUpdate } from './'

export async function run() {
  const argv = await yargs(process.argv.slice(2))
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

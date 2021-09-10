#!/usr/bin/env node

import yargs from 'yargs'
import { interactiveUpdate } from '../lib/interactiveUpdate.js'

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

interactiveUpdate({ update: argv.update })
  .then(() => {
    process.exit(0)
  })
  .catch((err) => {
    console.log(err)
    process.exit(1)
  })

#!/usr/bin/env node

import { run } from '../lib/cli.js'

run()
  .then(() => {
    process.exit(0)
  })
  .catch((err) => {
    console.log(err)
    process.exit(1)
  })

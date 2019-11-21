#!/usr/bin/env node

const cli = require('../lib/cli')
cli
  .run()
  .then(() => {
    process.exit(0)
  })
  .catch(err => {
    console.log(err)
    process.exit(1)
  })

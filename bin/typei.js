#!/usr/bin/env node

const cli = require('../lib/cli')
cli.run().catch(err => {
  console.log(err)
  process.exit(1)
})

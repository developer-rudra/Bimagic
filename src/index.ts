#!/usr/bin/env node

import { createCli } from './cli/index.js';

async function main() {
  const program = createCli();
  await program.parseAsync(process.argv);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

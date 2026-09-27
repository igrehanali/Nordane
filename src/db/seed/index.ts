import { runSeed } from './run';

/** CLI entry point: `npm run db:seed`. */
runSeed().catch((error: unknown) => {
  console.error('\nSeed failed:\n', error);
  process.exit(1);
});

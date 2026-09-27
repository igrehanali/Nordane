import { runSeed } from './run';

/**
 * Demo reset. Identical to the seed — the dataset is rebuilt from scratch rather
 * than patched — but named separately because this is what the nightly cron job
 * and `npm run db:reset` call, and that intent is worth reading in a log.
 */
runSeed()
  .then(() => {
    console.log('Demo data reset.');
  })
  .catch((error: unknown) => {
    console.error('\nDemo reset failed:\n', error);
    process.exit(1);
  });

import { confirm, input } from '@inquirer/prompts';
import chalk from 'chalk';
import { GitService } from '../../core/git/GitService.js';
import { logger } from '../../utils/logger/index.js';
import { renderFriendlyError } from '../../utils/errors/index.js';
import { withSpinner } from '../../ui/components/spinner.js';

export async function showPushMenu(gitService: GitService): Promise<void> {
  const status = await gitService.getDetailedStatus();

  logger.title('GIT PUSH OPERATION');

  console.log(`${chalk.bold('Current Branch:')} ${chalk.green(status.currentBranch)}`);
  console.log(`${chalk.bold('Remote:')}         ${chalk.cyan(status.remote || 'origin (default)')}`);
  console.log(`${chalk.bold('Commits Ahead:')}  ${chalk.yellow(status.ahead)}`);
  console.log();

  if (status.ahead === 0) {
    logger.info('Branch is up to date with remote (0 commits ahead).');
  }

  const confirmed = await confirm({
    message: `Push changes from branch "${status.currentBranch}" to remote?`,
    default: true
  });

  if (!confirmed) return;

  try {
    await withSpinner(
      `Pushing branch "${status.currentBranch}" to remote...`,
      () => gitService.push('origin', status.currentBranch)
    );
    logger.success(`Pushed branch "${status.currentBranch}" successfully!`);
  } catch (err) {
    renderFriendlyError(err, true);
  }
}

export async function showPullMenu(gitService: GitService): Promise<void> {
  const status = await gitService.getDetailedStatus();

  logger.title('GIT PULL OPERATION');

  console.log(`${chalk.bold('Current Branch:')} ${chalk.green(status.currentBranch)}`);
  console.log(`${chalk.bold('Remote:')}         ${chalk.cyan(status.remote || 'origin/main')}`);
  console.log(`${chalk.bold('Commits Behind:')} ${chalk.magenta(status.behind)}`);
  console.log();

  const confirmed = await confirm({
    message: `Pull updates from remote for branch "${status.currentBranch}"?`,
    default: true
  });

  if (!confirmed) return;

  try {
    await withSpinner(
      `Pulling latest changes for "${status.currentBranch}"...`,
      () => gitService.pull('origin', status.currentBranch)
    );
    logger.success(`Pulled latest changes successfully!`);
  } catch (err) {
    renderFriendlyError(err, true);
  }
}

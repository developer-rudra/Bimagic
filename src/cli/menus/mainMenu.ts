import { select } from '@inquirer/prompts';
import chalk from 'chalk';
import path from 'node:path';
import { RepositoryManager } from '../../core/repository/RepositoryManager.js';
import { logger } from '../../utils/logger/index.js';
import { renderFriendlyError } from '../../utils/errors/index.js';
import { showStatusDashboard } from './statusMenu.js';
import { showStagingMenu } from './stagingMenu.js';
import { showCommitMenu } from './commitMenu.js';
import { showBranchMenu } from './branchMenu.js';
import { showPushMenu, showPullMenu } from './remoteMenu.js';
import { showStashMenu } from './stashMenu.js';
import { showCloneMenu } from './cloneMenu.js';
import { showConfigMenu } from './configMenu.js';
import { showRepoSelectionMenu } from './repoMenu.js';

export async function runMainDashboardLoop(repoManager: RepositoryManager): Promise<void> {
  while (true) {
    const gitService = repoManager.getGitService();
    const isRepo = await repoManager.isCurrentDirectoryRepo();

    if (!isRepo) {
      console.log();
      logger.warning('No Git repository detected in current directory.');
      console.log(chalk.dim(`Current Path: ${repoManager.getCurrentPath()}\n`));

      const selectedRepo = await showRepoSelectionMenu(repoManager);
      if (!selectedRepo) {
        // If repo selection was cancelled or returned false without changing repo
        continue;
      }
    }

    // Current directory is a Git repo
    const status = await gitService.getDetailedStatus();

    logger.banner();
    console.log(chalk.bold('Repository: ') + chalk.cyan.bold(status.repoName));
    console.log(chalk.bold('Branch:     ') + chalk.green.bold(status.currentBranch));
    console.log(chalk.bold('Path:       ') + chalk.dim(status.repoPath));
    console.log();

    console.log(chalk.bold('Status Summary:'));
    console.log(
      `  Modified: ${chalk.yellow(status.modifiedCount.toString())} | Staged: ${chalk.green(status.stagedCount.toString())} | Untracked: ${chalk.red(status.untrackedCount.toString())}`
    );
    console.log(
      `  Ahead: ${chalk.blue(status.ahead.toString())} | Behind: ${chalk.magenta(status.behind.toString())}`
    );

    if (status.lastCommit) {
      console.log('\n' + chalk.bold('Last Commit:'));
      console.log(`  ${chalk.dim(status.lastCommit.hash)} - ${status.lastCommit.message}`);
    }
    console.log();

    const action = await select({
      message: 'Choose action:',
      choices: [
        { name: '📊 Repository Status', value: 'STATUS' },
        { name: '➕ Stage Changes', value: 'STAGE' },
        { name: '✨ Commit Changes', value: 'COMMIT' },
        { name: '🌿 Branch Management', value: 'BRANCH' },
        { name: '📦 Stash Management', value: 'STASH' },
        { name: '🚀 Push to Remote', value: 'PUSH' },
        { name: '📥 Pull from Remote', value: 'PULL' },
        { name: '📁 Select / Switch Repository', value: 'SELECT_REPO' },
        { name: '🌐 Clone Repository', value: 'CLONE' },
        { name: '⚙️  Settings', value: 'SETTINGS' },
        { name: '🚪 Exit', value: 'EXIT' }
      ]
    });

    try {
      switch (action) {
        case 'STATUS':
          await showStatusDashboard(gitService);
          break;
        case 'STAGE':
          await showStagingMenu(gitService);
          break;
        case 'COMMIT':
          await showCommitMenu(gitService);
          break;
        case 'BRANCH':
          await showBranchMenu(gitService);
          break;
        case 'STASH':
          await showStashMenu(gitService);
          break;
        case 'PUSH':
          await showPushMenu(gitService);
          break;
        case 'PULL':
          await showPullMenu(gitService);
          break;
        case 'SELECT_REPO':
          await showRepoSelectionMenu(repoManager);
          break;
        case 'CLONE':
          await showCloneMenu(repoManager);
          break;
        case 'SETTINGS':
          await showConfigMenu();
          break;
        case 'EXIT':
          logger.info('Thank you for using Bimagic!');
          process.exit(0);
      }
    } catch (err) {
      renderFriendlyError(err, true);
    }
  }
}

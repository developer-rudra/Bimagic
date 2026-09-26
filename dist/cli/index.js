import { Command } from 'commander';
import { RepositoryManager } from '../core/repository/RepositoryManager.js';
import { logger } from '../utils/logger/index.js';
import { runMainDashboardLoop } from './menus/mainMenu.js';
import { showStatusDashboard } from './menus/statusMenu.js';
import { showCommitMenu } from './menus/commitMenu.js';
import { showBranchMenu } from './menus/branchMenu.js';
import { showStashMenu } from './menus/stashMenu.js';
import { showPushMenu, showPullMenu } from './menus/remoteMenu.js';
import { showCloneMenu } from './menus/cloneMenu.js';
import { showConfigMenu } from './menus/configMenu.js';
import { showRepoSelectionMenu } from './menus/repoMenu.js';
import chalk from 'chalk';
export function createCli() {
    const program = new Command();
    const repoManager = new RepositoryManager();
    program
        .name('bimagic')
        .description('Interactive, visual CLI wrapper for Git')
        .version('1.0.0', '-v, --version', 'Output the current version of Bimagic');
    const checkRepoGuard = async () => {
        const isRepo = await repoManager.isCurrentDirectoryRepo();
        if (!isRepo) {
            console.log();
            logger.error('No Git repository detected in the current directory.');
            console.log(chalk.dim(`Path: ${repoManager.getCurrentPath()}\n`));
            const chosen = await showRepoSelectionMenu(repoManager);
            return chosen;
        }
        return true;
    };
    program
        .command('status')
        .description('View detailed repository status dashboard')
        .action(async () => {
        if (await checkRepoGuard()) {
            await showStatusDashboard(repoManager.getGitService());
        }
    });
    program
        .command('commit')
        .description('Guided Magic Conventional Commit builder')
        .action(async () => {
        if (await checkRepoGuard()) {
            await showCommitMenu(repoManager.getGitService());
        }
    });
    program
        .command('branch')
        .description('Manage repository branches')
        .action(async () => {
        if (await checkRepoGuard()) {
            await showBranchMenu(repoManager.getGitService());
        }
    });
    program
        .command('stash')
        .description('Manage repository stashes')
        .action(async () => {
        if (await checkRepoGuard()) {
            await showStashMenu(repoManager.getGitService());
        }
    });
    program
        .command('push')
        .description('Push changes to remote repository')
        .action(async () => {
        if (await checkRepoGuard()) {
            await showPushMenu(repoManager.getGitService());
        }
    });
    program
        .command('pull')
        .description('Pull changes from remote repository')
        .action(async () => {
        if (await checkRepoGuard()) {
            await showPullMenu(repoManager.getGitService());
        }
    });
    program
        .command('clone')
        .description('Interactively clone a repository or setup sparse checkout')
        .action(async () => {
        await showCloneMenu(repoManager);
    });
    program
        .command('config')
        .description('View or modify Bimagic settings and recent repositories')
        .action(async () => {
        await showConfigMenu();
    });
    program
        .action(async () => {
        const isRepo = await repoManager.isCurrentDirectoryRepo();
        if (isRepo) {
            const status = await repoManager.getGitService().getDetailedStatus();
            logger.success('Git repository detected');
            console.log(`Repository: ${chalk.bold(status.repoName)}`);
            console.log(`Branch:     ${chalk.green.bold(status.currentBranch)}\n`);
        }
        else {
            logger.warning('No Git repository detected in the current directory.');
        }
        await runMainDashboardLoop(repoManager);
    });
    return program;
}

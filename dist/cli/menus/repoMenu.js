import { select, input } from '@inquirer/prompts';
import chalk from 'chalk';
import path from 'node:path';
import fs from 'node:fs';
import { logger } from '../../utils/logger/index.js';
import { renderFriendlyError } from '../../utils/errors/index.js';
export async function showRepoSelectionMenu(repoManager) {
    logger.title('BIMAGIC - Repository Selection');
    const recent = repoManager.getRecentRepositories();
    const choices = [];
    if (recent.length > 0) {
        choices.push({ name: chalk.bold('--- Recent Repositories ---'), value: '__HEADER_RECENT__' });
        for (const r of recent) {
            choices.push({
                name: `🕒 ${path.basename(r)} (${r})`,
                value: r
            });
        }
    }
    choices.push({ name: chalk.bold('--- Actions ---'), value: '__HEADER_ACTIONS__' });
    choices.push({ name: '📁 Browse Local Directory', value: '__BROWSE__' });
    choices.push({ name: '✨ Initialize New Repository', value: '__INIT__' });
    choices.push({ name: '🌐 Clone Remote Repository', value: '__CLONE__' });
    choices.push({ name: '🚪 Exit Bimagic', value: '__EXIT__' });
    const selected = await select({
        message: 'Select a Git repository or action:',
        choices: choices.filter(c => !c.value.startsWith('__HEADER_'))
    });
    if (selected === '__EXIT__') {
        logger.info('Goodbye!');
        process.exit(0);
    }
    if (selected === '__INIT__') {
        const targetDir = await input({
            message: 'Enter path for new Git repository (leave empty for current directory):',
            default: process.cwd()
        });
        try {
            const resolved = path.resolve(targetDir);
            if (!fs.existsSync(resolved)) {
                fs.mkdirSync(resolved, { recursive: true });
            }
            await repoManager.initializeRepository(resolved);
            logger.success(`Initialized Git repository at: ${resolved}`);
            return true;
        }
        catch (err) {
            renderFriendlyError(err);
            return false;
        }
    }
    if (selected === '__CLONE__') {
        return false; // Will trigger clone workflow
    }
    if (selected === '__BROWSE__') {
        let currentBrowsePath = process.cwd();
        while (true) {
            const subdirs = repoManager.listSubdirectories(currentBrowsePath);
            const parentDir = path.dirname(currentBrowsePath);
            const dirChoices = [];
            if (parentDir !== currentBrowsePath) {
                dirChoices.push({ name: '⬆ .. (Parent Directory)', value: parentDir });
            }
            const isCurrentRepo = await repoManager.getGitService().isGitRepository(currentBrowsePath);
            if (isCurrentRepo) {
                dirChoices.push({ name: chalk.green.bold(`✔ Select Current Directory [${path.basename(currentBrowsePath)}]`), value: '__SELECT_CURRENT__' });
            }
            for (const d of subdirs) {
                const repoTag = d.isGitRepo ? chalk.green(' (Git Repo)') : '';
                dirChoices.push({
                    name: `📁 ${d.name}${repoTag}`,
                    value: d.fullPath
                });
            }
            dirChoices.push({ name: '🔙 Back to Menu', value: '__CANCEL__' });
            console.log(chalk.dim(`Current path: ${currentBrowsePath}`));
            const browseChoice = await select({
                message: 'Navigate folders:',
                choices: dirChoices
            });
            if (browseChoice === '__CANCEL__') {
                return false;
            }
            if (browseChoice === '__SELECT_CURRENT__') {
                await repoManager.setRepositoryPath(currentBrowsePath);
                return true;
            }
            // Check if selected directory is a valid git repository directly
            const isTargetRepo = await repoManager.getGitService().isGitRepository(browseChoice);
            if (isTargetRepo) {
                const action = await select({
                    message: `Folder "${path.basename(browseChoice)}" is a Git repository:`,
                    choices: [
                        { name: '✔ Open this repository', value: 'OPEN' },
                        { name: '📁 Enter directory', value: 'ENTER' }
                    ]
                });
                if (action === 'OPEN') {
                    await repoManager.setRepositoryPath(browseChoice);
                    return true;
                }
            }
            currentBrowsePath = browseChoice;
        }
    }
    // Selected a specific repo path from recent repos
    const success = await repoManager.setRepositoryPath(selected);
    if (!success) {
        logger.error(`The directory "${selected}" is not a valid Git repository.`);
        return false;
    }
    return true;
}
